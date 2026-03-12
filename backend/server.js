const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

try {
  const app = require('./src/App');
  const PORT = process.env.PORT || 5002;
  const MONGODB_URI = process.env.MONGODB_URI;

  console.log('App loaded successfully');
  console.log('MONGODB_URI:', MONGODB_URI ? MONGODB_URI.substring(0, 30) + '...' : 'Not set');

  // MongoDB connection with Mongoose
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    retryWrites: true,
    w: 'majority',
    maxPoolSize: 10,
    minPoolSize: 2
  })
    .then(() => {
      console.log('✅ Connected to MongoDB with Mongoose');
    })
    .catch(err => {
      console.error('❌ Failed to connect to MongoDB:', err.message);
      console.error('Make sure:');
      console.error('1. MongoDB Atlas IP whitelist includes your IP (0.0.0.0/0 for any)');
      console.error('2. MONGODB_URI in .env is correct');
      console.error('3. Your internet connection is stable');
    });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  }).on('error', (err) => {
    console.error('Server listen error:', err);
  });
} catch (error) {
  console.error('Error loading app:', error);
  process.exit(1);
}