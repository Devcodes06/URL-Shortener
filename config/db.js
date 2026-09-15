const mongoose = require('mongoose');

// Disable buffering so queries fail quickly if connection is not established
mongoose.set('bufferCommands', false);

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 20000,
  maxPoolSize: 5,
};

let cached = globalThis.__mongooseConn;

if (!cached) {
  cached = globalThis.__mongooseConn = { conn: null, promise: null };
}

async function connectToMongoDB(uri = process.env.MONGODB_URI) {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing or empty');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, MONGO_OPTIONS).then((m) => {
      cached.conn = m;
      return m;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

function getConnection() {
  return mongoose.connection;
}

module.exports = { connectToMongoDB, getConnection };

