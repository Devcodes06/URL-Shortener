const mongoose = require('mongoose');

async function connectToMongoDB(url) {
  try {
    await mongoose.connect(url);
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = { connectToMongoDB };
