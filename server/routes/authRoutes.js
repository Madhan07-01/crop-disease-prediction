const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../utils/memoryStore');
const ApiError = require('../utils/apiError');

const router = express.Router();

// Helper: generate token and user payload
const createAuthResponse = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'agrivision_secret_key',
    { expiresIn: '7d' }
  );
  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  };
};

// Return demo account credentials for easy 1-click role testing
router.get('/demo-accounts', (req, res) => {
  res.json({
    accounts: [
      {
        role: 'farmer',
        label: 'Farmer / Grower',
        email: 'farmer@agrivision.com',
        password: 'Farmer@123',
        name: 'Ramesh Kumar'
      },
      {
        role: 'officer',
        label: 'Agricultural Field Officer',
        email: 'officer@agrivision.com',
        password: 'Officer@123',
        name: 'Dr. Priya Sharma'
      },
      {
        role: 'admin',
        label: 'Platform Administrator',
        email: 'admin@agrivision.com',
        password: 'Admin@123',
        name: 'Dr. Vikramaditya'
      }
    ]
  });
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const fullName = req.body.fullName?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    let role = req.body.role?.trim().toLowerCase() || 'farmer';

    if (!['farmer', 'officer', 'admin'].includes(role)) {
      role = 'farmer';
    }

    if (!fullName || !email || !password) {
      throw new ApiError(400, 'Full name, email, and password are required.');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new ApiError(400, 'Enter a valid email address.');
    }
    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters long.');
    }

    const existingUser = memoryStore.isMongoConnected(mongoose)
      ? await User.findOne({ email })
      : memoryStore.findUserByEmail(email);

    if (existingUser) {
      throw new ApiError(409, 'An account already exists with this email address.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser;
    if (memoryStore.isMongoConnected(mongoose)) {
      newUser = new User({ fullName, email, passwordHash, role });
      await newUser.save();
    } else {
      newUser = memoryStore.createUser({ fullName, email, passwordHash, role });
    }

    const authData = createAuthResponse(newUser);
    res.status(201).json({
      message: 'Account created successfully',
      ...authData
    });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    const user = memoryStore.isMongoConnected(mongoose)
      ? await User.findOne({ email })
      : memoryStore.findUserByEmail(email);

    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const authData = createAuthResponse(user);
    res.json({
      message: 'Signed in successfully',
      ...authData
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
