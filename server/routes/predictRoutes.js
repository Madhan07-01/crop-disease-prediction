const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const mongoose = require('mongoose');
const Prediction = require('../models/Prediction');
const Treatment = require('../models/Treatment');
const authMiddleware = require('../middleware/authMiddleware');
const memoryStore = require('../utils/memoryStore');
const ApiError = require('../utils/apiError');

const router = express.Router();

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) return callback(null, true);
    callback(new ApiError(415, 'Upload a PNG or JPEG image.'));
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res, next) => {
  if (!req.file) return next(new ApiError(400, 'Choose a crop image before requesting analysis.'));

  try {
    const cropName = req.body.cropName?.trim() || 'Crop Leaf';
    const farmLocation = req.body.farmLocation?.trim() || 'Primary Field Plot';
    const notes = req.body.notes?.trim() || '';

    // 1. Forward the image to the Flask AI microservice
    const formData = new FormData();
    formData.append('file', req.file.buffer, { filename: req.file.originalname, contentType: req.file.mimetype });

    let aiResponse;
    try {
      aiResponse = await axios.post(process.env.FLASK_AI_URL || 'http://localhost:5000/predict', formData, {
        headers: { ...formData.getHeaders() }
      });
    } catch (flaskErr) {
      console.error('Flask API Error:', flaskErr.message);
      return next(new ApiError(503, 'The AI analysis service is currently unavailable. Please check that the Flask server is running on port 5000.'));
    }

    const { prediction, confidence } = aiResponse.data;
    if (!prediction || typeof confidence !== 'number') {
      throw new ApiError(502, 'The AI service returned an incomplete prediction.');
    }

    // Determine severity heuristic based on confidence and disease type
    const isHealthy = prediction.toLowerCase().includes('healthy');
    let severity = 'Medium';
    if (isHealthy) {
      severity = 'Low';
    } else if (confidence > 0.85) {
      severity = 'High';
    } else if (confidence > 0.95) {
      severity = 'Critical';
    }

    // 2. Fetch corresponding treatment from MongoDB or fallback library
    let treatment = memoryStore.isMongoConnected(mongoose)
      ? await Treatment.findOne({ diseaseName: prediction })
      : null;

    if (!treatment) {
      // Extensive fallback treatments library
      const fallbackTreatments = {
        Tomato___Early_blight: {
          organicTreatment: 'Apply copper-based organic fungicides. Remove affected lower foliage and mulch with straw.',
          chemicalTreatment: 'Apply chlorothalonil or azoxystrobin fungicides at first sign of circular lesions.',
          preventionSteps: ['Maintain 24-inch plant spacing for airflow', 'Water strictly at soil base; avoid splashing leaves', 'Rotate solanaceous crops on a 3-year cycle']
        },
        Potato___Early_blight: {
          organicTreatment: 'Spray bio-fungicides containing Bacillus subtilis or liquid copper soap every 7-10 days.',
          chemicalTreatment: 'Apply mancozeb or difenoconazole according to local label rates.',
          preventionSteps: ['Hill potatoes well to shield tubers', 'Destroy cull piles and harvest in dry conditions', 'Ensure adequate nitrogen balance']
        },
        Apple___Apple_scab: {
          organicTreatment: 'Rake and burn fallen orchard leaves in autumn. Apply wettable sulfur sprays before spring rains.',
          chemicalTreatment: 'Apply myclobutanil or captan fungicide during green-tip through petal-fall.',
          preventionSteps: ['Prune canopies to maximize sun and air penetration', 'Choose scab-resistant cultivars', 'Install drip irrigation']
        }
      };

      const matched = fallbackTreatments[prediction];
      if (matched) {
        treatment = { diseaseName: prediction, ...matched };
      } else if (isHealthy) {
        treatment = {
          diseaseName: prediction,
          organicTreatment: 'Maintain standard regenerative compost tea and balanced organic nutrition.',
          chemicalTreatment: 'No chemical intervention required.',
          preventionSteps: ['Continue scheduled visual field scouting', 'Maintain optimal drip irrigation scheduling', 'Monitor local humidity levels']
        };
      } else {
        treatment = {
          diseaseName: prediction,
          organicTreatment: 'Isolate affected plants immediately. Spray neem oil (0.5%) or potassium bicarbonate solution.',
          chemicalTreatment: 'Consult your district agricultural officer or extension center for approved targeted fungicide/bactericide.',
          preventionSteps: ['Disinfect pruning shears between plants', 'Avoid working in wet fields to prevent spore dispersal', 'Ensure proper soil drainage']
        };
      }
    }

    // 3. Save the prediction report
    let savedRecord;
    if (memoryStore.isMongoConnected(mongoose)) {
      const newPrediction = new Prediction({
        userId: req.user.id,
        cropName,
        farmLocation,
        notes,
        predictedDisease: prediction,
        confidenceScore: confidence,
        severity,
        status: 'pending_verification',
        imageUrl: ''
      });
      savedRecord = await newPrediction.save();
    } else {
      savedRecord = memoryStore.addPrediction({
        userId: req.user.id,
        cropName,
        farmLocation,
        notes,
        predictedDisease: prediction,
        confidenceScore: confidence,
        severity,
        imageUrl: ''
      });
    }

    // 4. Return complete result payload
    res.status(201).json({
      reportId: savedRecord._id,
      prediction,
      confidence,
      severity,
      cropName,
      farmLocation,
      notes,
      status: 'pending_verification',
      treatment,
      scannedAt: savedRecord.scannedAt || new Date().toISOString()
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
