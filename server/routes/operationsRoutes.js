const express = require('express');
const mongoose = require('mongoose');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');
const memoryStore = require('../utils/memoryStore');
const ApiError = require('../utils/apiError');

const router = express.Router();

// 1. List of registered Agricultural Officers (accessible to all authenticated users for viewing/assignment)
router.get('/officers', authMiddleware, async (req, res, next) => {
  try {
    if (!memoryStore.isMongoConnected(mongoose)) {
      const officers = memoryStore.getUsersByRole('officer').map((u) => ({
        _id: u._id,
        fullName: u.fullName,
        email: u.email
      }));
      return res.json({ officers });
    }

    const officers = await User.find({ role: 'officer' }).select('_id fullName email');
    res.json({ officers });
  } catch (err) {
    next(err);
  }
});

// 2. Incident & Disease Reports Queue (Filtered by role, preview mode, and status)
router.get('/reports', authMiddleware, async (req, res, next) => {
  try {
    const { status, severity, crop, roleView } = req.query;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const effectiveRole = roleView || req.user.role;

    if (!memoryStore.isMongoConnected(mongoose)) {
      let reports = memoryStore.getAllPredictions();

      if (effectiveRole === 'officer') {
        // Show reports assigned or unassigned
        reports = reports.filter((r) => !r.assignedOfficerId || r.assignedOfficerId === req.user.id || r.assignedOfficerId === 'usr_officer_1');
      } else if (effectiveRole === 'farmer' && !roleView) {
        reports = reports.filter((r) => r.userId === req.user.id);
      }
      // If admin, show all reports

      if (status && status !== 'All') {
        reports = reports.filter((r) => r.status === status);
      }
      if (severity && severity !== 'All') {
        reports = reports.filter((r) => r.severity === severity);
      }
      if (crop && crop !== 'All') {
        reports = reports.filter((r) => r.cropName?.toLowerCase() === crop.toLowerCase());
      }

      return res.json({
        reports: reports.slice(0, limit),
        total: reports.length,
        source: 'memory'
      });
    }

    // MongoDB query path
    const filter = {};
    if (effectiveRole === 'officer') {
      filter.$or = [{ assignedOfficerId: req.user.id }, { assignedOfficerId: null }];
    } else if (effectiveRole === 'farmer' && !roleView) {
      filter.userId = req.user.id;
    }

    if (status && status !== 'All') filter.status = status;
    if (severity && severity !== 'All') filter.severity = severity;
    if (crop && crop !== 'All') filter.cropName = new RegExp(crop, 'i');

    const reports = await Prediction.find(filter)
      .sort({ scannedAt: -1 })
      .limit(limit)
      .populate('userId', 'fullName email')
      .populate('assignedOfficerId', 'fullName email');

    res.json({ reports, total: reports.length, source: 'mongodb' });
  } catch (error) {
    next(error);
  }
});

// 3. Platform Administration Operational Summary (accessible to all authenticated users for overview/preview)
router.get('/summary', authMiddleware, async (req, res, next) => {
  try {
    if (!memoryStore.isMongoConnected(mongoose)) {
      const allReports = memoryStore.getAllPredictions();
      const allUsers = memoryStore.getAllUsers();

      return res.json({
        registeredFarmers: allUsers.filter((u) => u.role === 'farmer').length,
        activeOfficers: allUsers.filter((u) => u.role === 'officer').length,
        totalUsers: allUsers.length,
        totalReports: allReports.length,
        pendingReview: allReports.filter((r) => r.status === 'pending_verification').length,
        inProgress: allReports.filter((r) => ['officer_assigned', 'under_investigation', 'treatment_applied'].includes(r.status)).length,
        resolved: allReports.filter((r) => r.status === 'resolved').length,
        highSeverityAlerts: allReports.filter((r) => ['High', 'Critical'].includes(r.severity)).length,
        source: 'memory'
      });
    }

    const [allUsers, allReports] = await Promise.all([
      User.find({}),
      Prediction.find({})
    ]);

    res.json({
      registeredFarmers: allUsers.filter((u) => u.role === 'farmer').length,
      activeOfficers: allUsers.filter((u) => u.role === 'officer').length,
      totalUsers: allUsers.length,
      totalReports: allReports.length,
      pendingReview: allReports.filter((r) => r.status === 'pending_verification').length,
      inProgress: allReports.filter((r) => ['officer_assigned', 'under_investigation', 'treatment_applied'].includes(r.status)).length,
      resolved: allReports.filter((r) => r.status === 'resolved').length,
      highSeverityAlerts: allReports.filter((r) => ['High', 'Critical'].includes(r.severity)).length,
      source: 'mongodb'
    });
  } catch (error) {
    next(error);
  }
});

// 4. Admin Verifies a Diagnosis & Assigns Severity
router.patch('/reports/:id/verify', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { severity, adminNotes, status } = req.body;

    const updates = {
      severity: severity || 'Medium',
      adminNotes: adminNotes || '',
      status: status || 'officer_assigned'
    };

    if (!memoryStore.isMongoConnected(mongoose)) {
      const updated = memoryStore.updatePrediction(id, updates);
      if (!updated) throw new ApiError(404, 'Report not found.');
      return res.json({ message: 'Report verified successfully', report: updated });
    }

    const report = await Prediction.findByIdAndUpdate(id, updates, { new: true });
    if (!report) throw new ApiError(404, 'Report not found.');
    res.json({ message: 'Report verified successfully', report });
  } catch (err) {
    next(err);
  }
});

// 5. Admin Assigns an Agricultural Field Officer
router.patch('/reports/:id/assign', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { officerId, officerName } = req.body;

    if (!officerId) throw new ApiError(400, 'Please select an officer to assign.');

    const updates = {
      assignedOfficerId: officerId,
      assignedOfficerName: officerName || 'Field Officer',
      status: 'officer_assigned'
    };

    if (!memoryStore.isMongoConnected(mongoose)) {
      const updated = memoryStore.updatePrediction(id, updates);
      if (!updated) throw new ApiError(404, 'Report not found.');
      return res.json({ message: 'Officer assigned successfully', report: updated });
    }

    const report = await Prediction.findByIdAndUpdate(id, updates, { new: true });
    if (!report) throw new ApiError(404, 'Report not found.');
    res.json({ message: 'Officer assigned successfully', report });
  } catch (err) {
    next(err);
  }
});

// 6. Agricultural Officer Records Field Reading & Treatment Actions
router.patch('/reports/:id/action', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { soilPh, moisturePercent, affectedAreaPercent, actionTaken, notes, status } = req.body;

    const user = memoryStore.isMongoConnected(mongoose)
      ? await User.findById(req.user.id)
      : memoryStore.findUserById(req.user.id);

    const officerName = user?.fullName || 'Agricultural Officer';

    const fieldReadings = {
      soilPh: soilPh !== undefined && soilPh !== '' ? Number(soilPh) : null,
      moisturePercent: moisturePercent !== undefined && moisturePercent !== '' ? Number(moisturePercent) : null,
      affectedAreaPercent: affectedAreaPercent !== undefined && affectedAreaPercent !== '' ? Number(affectedAreaPercent) : null,
      actionTaken: actionTaken || 'Inspection performed and guidance provided.',
      notes: notes || '',
      recordedAt: new Date(),
      officerName
    };

    const updates = {
      fieldReadings,
      status: status || 'treatment_applied'
    };

    if (!memoryStore.isMongoConnected(mongoose)) {
      const updated = memoryStore.updatePrediction(id, updates);
      if (!updated) throw new ApiError(404, 'Report not found.');
      return res.json({ message: 'Field action recorded successfully', report: updated });
    }

    const report = await Prediction.findByIdAndUpdate(id, updates, { new: true });
    if (!report) throw new ApiError(404, 'Report not found.');
    res.json({ message: 'Field action recorded successfully', report });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
