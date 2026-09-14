const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
  diseaseName: { type: String, required: true, unique: true },
  organicTreatment: { type: String, required: true },
  chemicalTreatment: { type: String, required: true },
  preventionSteps: [{ type: String }]
});

module.exports = mongoose.model('Treatment', treatmentSchema);
