require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Treatment = require('./models/Treatment');
const Prediction = require('./models/Prediction');

const seedTreatments = [
  {
    diseaseName: 'Apple___Apple_scab',
    organicTreatment: 'Rake and burn fallen orchard leaves in autumn. Apply wettable sulfur or liquid copper sprays before spring rains.',
    chemicalTreatment: 'Apply myclobutanil or captan fungicide during green-tip through petal-fall stages.',
    preventionSteps: ['Prune tree canopies for air circulation', 'Install drip irrigation to keep leaves dry', 'Select scab-resistant rootstocks']
  },
  {
    diseaseName: 'Potato___Early_blight',
    organicTreatment: 'Spray bio-fungicides containing Bacillus subtilis or copper hydroxide at 7-10 day intervals.',
    chemicalTreatment: 'Apply chlorothalonil, mancozeb, or difenoconazole according to regional label rates.',
    preventionSteps: ['Rotate crops with non-solanaceous species every 3 years', 'Ensure adequate nitrogen and potassium soil balance', 'Hill potatoes well to protect developing tubers']
  },
  {
    diseaseName: 'Tomato___Early_blight',
    organicTreatment: 'Apply copper hydroxide or Bordeaux mixture (1%). Remove infected lower foliage immediately and mulch with organic straw.',
    chemicalTreatment: 'Apply azoxystrobin (18.2%) + difenoconazole (11.4%) SC at 1.0 ml/L or mancozeb 75% WP at 2.5 g/L.',
    preventionSteps: ['Maintain 24-inch spacing between rows for airflow', 'Water strictly at soil base using drip lines', 'Disinfect pruning tools between plants']
  },
  {
    diseaseName: 'Tomato___Late_blight',
    organicTreatment: 'Apply fixed copper soap or copper octanoate preemptively before sustained rain periods.',
    chemicalTreatment: 'Apply metalaxyl + mancozeb or cymoxanil upon confirmation of water-soaked lesions.',
    preventionSteps: ['Destroy volunteer tomato and potato plants nearby', 'Scout crops daily in cool, wet weather', 'Avoid overhead sprinkler irrigation']
  },
  {
    diseaseName: 'Tomato___healthy',
    organicTreatment: 'Maintain standard regenerative compost tea and balanced organic nutrition.',
    chemicalTreatment: 'No chemical intervention required.',
    preventionSteps: ['Continue weekly scouting routines', 'Maintain optimal drip irrigation scheduling', 'Monitor field humidity and soil pH']
  }
];

const seedDatabase = async () => {
  console.log('Seeding demo users, treatments, and operational reports...');

  // 1. Seed Demo Users if not present
  const farmerHash = await bcrypt.hash('Farmer@123', 10);
  const officerHash = await bcrypt.hash('Officer@123', 10);
  const adminHash = await bcrypt.hash('Admin@123', 10);

  let farmer = await User.findOne({ email: 'farmer@agrivision.com' });
  if (!farmer) {
    farmer = await User.create({
      fullName: 'Ramesh Kumar',
      email: 'farmer@agrivision.com',
      passwordHash: farmerHash,
      role: 'farmer'
    });
  }

  let officer1 = await User.findOne({ email: 'officer@agrivision.com' });
  if (!officer1) {
    officer1 = await User.create({
      fullName: 'Dr. Priya Sharma (Senior Agronomist)',
      email: 'officer@agrivision.com',
      passwordHash: officerHash,
      role: 'officer'
    });
  }

  let officer2 = await User.findOne({ email: 'anand.officer@agrivision.com' });
  if (!officer2) {
    officer2 = await User.create({
      fullName: 'Anand Patel (Field Specialist)',
      email: 'anand.officer@agrivision.com',
      passwordHash: officerHash,
      role: 'officer'
    });
  }

  let admin = await User.findOne({ email: 'admin@agrivision.com' });
  if (!admin) {
    admin = await User.create({
      fullName: 'Dr. Vikramaditya (Admin)',
      email: 'admin@agrivision.com',
      passwordHash: adminHash,
      role: 'admin'
    });
  }

  // 2. Seed Treatments
  for (const t of seedTreatments) {
    await Treatment.findOneAndUpdate(
      { diseaseName: t.diseaseName },
      t,
      { upsert: true, returnDocument: 'after' }
    );
  }

  // 3. Seed Sample Operational Reports if empty
  const reportCount = await Prediction.countDocuments();
  if (reportCount === 0) {
    await Prediction.insertMany([
      {
        userId: farmer._id,
        cropName: 'Tomato',
        farmLocation: 'North Green Acre - Block 4A',
        notes: 'Noticed dark circular target spots on lower foliage following heavy morning dew.',
        predictedDisease: 'Tomato___Early_blight',
        confidenceScore: 0.942,
        severity: 'High',
        status: 'pending_verification',
        assignedOfficerId: null,
        assignedOfficerName: null,
        adminNotes: '',
        fieldReadings: null,
        scannedAt: new Date(Date.now() - 1000 * 60 * 25)
      },
      {
        userId: farmer._id,
        cropName: 'Potato',
        farmLocation: 'Sundar Valley - Sector 2',
        notes: 'Leaf curling and yellow margin spots observed across 2 rows.',
        predictedDisease: 'Potato___Early_blight',
        confidenceScore: 0.915,
        severity: 'Medium',
        status: 'officer_assigned',
        assignedOfficerId: officer1._id,
        assignedOfficerName: officer1.fullName,
        adminNotes: 'Officer assigned for physical soil and foliage assessment.',
        fieldReadings: null,
        scannedAt: new Date(Date.now() - 1000 * 60 * 120)
      },
      {
        userId: farmer._id,
        cropName: 'Apple',
        farmLocation: 'Hillside Orchard - Plot B',
        notes: 'Velvety olive-brown lesions detected on upper leaf surface.',
        predictedDisease: 'Apple___Apple_scab',
        confidenceScore: 0.963,
        severity: 'High',
        status: 'under_investigation',
        assignedOfficerId: officer1._id,
        assignedOfficerName: officer1.fullName,
        adminNotes: 'Verified case. Immediate organic spray recommended.',
        fieldReadings: {
          soilPh: 6.4,
          moisturePercent: 78,
          affectedAreaPercent: 12,
          actionTaken: 'Applied protective copper fungicide; instructed base-drip irrigation.',
          notes: 'Canopy density needs pruning to facilitate aeration and dry leaves quickly.',
          recordedAt: new Date(Date.now() - 1000 * 60 * 45),
          officerName: officer1.fullName
        },
        scannedAt: new Date(Date.now() - 1000 * 60 * 360)
      },
      {
        userId: farmer._id,
        cropName: 'Tomato',
        farmLocation: 'Riverbend Cooperative - Polyhouse 1',
        notes: 'Routine healthy inspection follow-up.',
        predictedDisease: 'Tomato___healthy',
        confidenceScore: 0.988,
        severity: 'Low',
        status: 'resolved',
        assignedOfficerId: officer2._id,
        assignedOfficerName: officer2.fullName,
        adminNotes: 'Confirmed healthy foliage.',
        fieldReadings: {
          soilPh: 6.8,
          moisturePercent: 62,
          affectedAreaPercent: 0,
          actionTaken: 'Routine preventive neem oil mist spray.',
          notes: 'Crop condition optimal. No pathogens visible.',
          recordedAt: new Date(Date.now() - 86400000),
          officerName: officer2.fullName
        },
        scannedAt: new Date(Date.now() - 86400000 * 1.5)
      }
    ]);
  }

  console.log('Seeding completed successfully!');
};

if (require.main === module) {
  const uri = process.env.MONGO_URI || 'mongodb://adminUser:Admin%40123@127.0.0.1:27017/crop_disease_db?authSource=admin';
  mongoose.connect(uri)
    .then(async () => {
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
