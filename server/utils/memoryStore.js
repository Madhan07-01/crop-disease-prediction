const bcrypt = require('bcryptjs');

const users = [];
const predictions = [];

const makeId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

const isMongoConnected = (mongoose) => mongoose && mongoose.connection && mongoose.connection.readyState === 1;

// Seed initial users for quick role testing
const initMemoryStore = () => {
  if (users.length > 0) return;

  const defaultPasswordHash = bcrypt.hashSync('Agri@123', 10);
  const farmerHash = bcrypt.hashSync('Farmer@123', 10);
  const officerHash = bcrypt.hashSync('Officer@123', 10);
  const adminHash = bcrypt.hashSync('Admin@123', 10);

  const farmer1 = {
    _id: 'usr_farmer_1',
    fullName: 'Ramesh Kumar',
    email: 'farmer@agrivision.com',
    passwordHash: farmerHash,
    role: 'farmer',
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date()
  };

  const officer1 = {
    _id: 'usr_officer_1',
    fullName: 'Dr. Priya Sharma (Senior Agronomist)',
    email: 'officer@agrivision.com',
    passwordHash: officerHash,
    role: 'officer',
    createdAt: new Date(Date.now() - 86400000 * 10),
    updatedAt: new Date()
  };

  const officer2 = {
    _id: 'usr_officer_2',
    fullName: 'Anand Patel (Field Specialist)',
    email: 'anand.officer@agrivision.com',
    passwordHash: defaultPasswordHash,
    role: 'officer',
    createdAt: new Date(Date.now() - 86400000 * 8),
    updatedAt: new Date()
  };

  const admin1 = {
    _id: 'usr_admin_1',
    fullName: 'Dr. Vikramaditya (Admin)',
    email: 'admin@agrivision.com',
    passwordHash: adminHash,
    role: 'admin',
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date()
  };

  users.push(farmer1, officer1, officer2, admin1);

  // Pre-seed realistic reports for the workflow
  predictions.push(
    {
      _id: 'rep_001',
      userId: farmer1._id,
      user: { fullName: farmer1.fullName, email: farmer1.email },
      cropName: 'Tomato',
      farmLocation: 'North Green Acre - Block 4A',
      notes: 'Noticed dark circular spots on lower foliage following heavy morning dew.',
      predictedDisease: 'Tomato___Early_blight',
      confidenceScore: 0.942,
      severity: 'High',
      status: 'pending_verification',
      assignedOfficerId: null,
      assignedOfficerName: null,
      adminNotes: '',
      fieldReadings: null,
      scannedAt: new Date(Date.now() - 1000 * 60 * 25) // 25 mins ago
    },
    {
      _id: 'rep_002',
      userId: farmer1._id,
      user: { fullName: farmer1.fullName, email: farmer1.email },
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
      scannedAt: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
    },
    {
      _id: 'rep_003',
      userId: farmer1._id,
      user: { fullName: farmer1.fullName, email: farmer1.email },
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
      scannedAt: new Date(Date.now() - 1000 * 60 * 360) // 6 hours ago
    },
    {
      _id: 'rep_004',
      userId: farmer1._id,
      user: { fullName: farmer1.fullName, email: farmer1.email },
      cropName: 'Tomato',
      farmLocation: 'Riverbend Cooperative - Polyhouse 1',
      notes: 'Healthy inspection follow-up.',
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
  );
};

initMemoryStore();

const findUserByEmail = (email) => users.find((user) => user.email.toLowerCase() === email.toLowerCase());
const findUserById = (id) => users.find((user) => user._id === id);

const createUser = ({ fullName, email, passwordHash, role = 'farmer' }) => {
  const user = {
    _id: makeId(),
    fullName,
    email: email.toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  users.push(user);
  return user;
};

const addPrediction = ({
  userId,
  cropName = 'Crop Leaf',
  farmLocation = 'Main Field Block',
  notes = '',
  predictedDisease,
  confidenceScore,
  severity = 'Medium',
  imageUrl = ''
}) => {
  const user = findUserById(userId);
  const prediction = {
    _id: makeId(),
    userId,
    user: user ? { fullName: user.fullName, email: user.email } : { fullName: 'Farmer', email: '' },
    cropName,
    farmLocation,
    notes,
    predictedDisease,
    confidenceScore,
    severity,
    status: 'pending_verification',
    assignedOfficerId: null,
    assignedOfficerName: null,
    adminNotes: '',
    fieldReadings: null,
    imageUrl,
    scannedAt: new Date()
  };
  predictions.unshift(prediction);
  return prediction;
};

const getPredictionsForUser = (userId) => predictions.filter((item) => item.userId === userId);
const getAllPredictions = () => [...predictions];
const getPredictionById = (id) => predictions.find((item) => item._id === id);

const updatePrediction = (id, updates) => {
  const index = predictions.findIndex((item) => item._id === id);
  if (index === -1) return null;
  predictions[index] = { ...predictions[index], ...updates, updatedAt: new Date() };
  return predictions[index];
};

const getUserCount = () => users.length;
const getPredictionCount = () => predictions.length;
const getUsersByRole = (role) => users.filter((u) => u.role === role);
const getAllUsers = () => users.map(({ passwordHash, ...safeUser }) => safeUser);

module.exports = {
  isMongoConnected,
  findUserByEmail,
  findUserById,
  createUser,
  addPrediction,
  getPredictionsForUser,
  getAllPredictions,
  getPredictionById,
  updatePrediction,
  getUserCount,
  getPredictionCount,
  getUsersByRole,
  getAllUsers
};
