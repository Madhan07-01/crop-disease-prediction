require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const predictRoutes = require('./routes/predictRoutes');
const historyRoutes = require('./routes/historyRoutes');
const operationsRoutes = require('./routes/operationsRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const memoryStore = require('./utils/memoryStore');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Root
app.get('/', (req, res) => {
  res.json({ name: 'AgriVision API', status: 'ready' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ready',
    database: memoryStore.isMongoConnected(mongoose) ? 'mongodb' : 'memory',
    aiService: process.env.FLASK_AI_URL || 'not configured'
  });
});

app.use((req, res) => res.status(404).json({ error: 'The requested API endpoint does not exist.' }));

app.use((error, req, res, next) => {
  if (error instanceof require('multer').MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Image must be 5 MB or smaller.' });
  }
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({ error: error.message || 'An unexpected server error occurred.' });
});

const { seedDatabase } = require('./seed');
const User = require('./models/User');

// Connect to MongoDB and start server
const PORT = process.env.PORT || 4000;
const LOCAL_FALLBACK_URI = 'mongodb://adminUser:Admin%40123@127.0.0.1:27017/crop_disease_db?authSource=admin';

const startServer = () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

const connectAndStart = async () => {
  const primaryUri = process.env.MONGO_URI || LOCAL_FALLBACK_URI;
  let connected = false;

  try {
    await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 4000 });
    console.log('Connected to MongoDB successfully');
    connected = true;
  } catch (err) {
    console.warn(`Primary MongoDB connection failed: ${err.message}`);

    // If primary was not the local fallback, attempt local fallback
    if (primaryUri !== LOCAL_FALLBACK_URI) {
      try {
        console.log('Attempting fallback to local MongoDB service...');
        await mongoose.connect(LOCAL_FALLBACK_URI, { serverSelectionTimeoutMS: 3000 });
        console.log('Connected to local MongoDB successfully');
        connected = true;
      } catch (localErr) {
        console.warn(`Local MongoDB fallback failed: ${localErr.message}`);
      }
    }
  }

  if (connected) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Database is empty: seeding demo accounts and clinical guidance...');
        await seedDatabase();
      }
    } catch (seedErr) {
      console.warn('Auto-seed check notice:', seedErr.message);
    }
  } else {
    console.warn('Starting with in-memory dev storage. Data will reset when the server stops.');
  }

  startServer();
};

connectAndStart();
