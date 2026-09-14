const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: false },
  cropName: { type: String, default: 'Crop Leaf' },
  farmLocation: { type: String, default: 'Main Field Block' },
  notes: { type: String, default: '' },
  predictedDisease: { type: String, required: true },
  confidenceScore: { type: Number, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: {
    type: String,
    enum: ['pending_verification', 'officer_assigned', 'under_investigation', 'treatment_applied', 'resolved'],
    default: 'pending_verification'
  },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedOfficerName: { type: String, default: null },
  adminNotes: { type: String, default: '' },
  fieldReadings: {
    soilPh: { type: Number, default: null },
    moisturePercent: { type: Number, default: null },
    affectedAreaPercent: { type: Number, default: null },
    actionTaken: { type: String, default: '' },
    notes: { type: String, default: '' },
    recordedAt: { type: Date, default: null },
    officerName: { type: String, default: '' }
  },
  scannedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
