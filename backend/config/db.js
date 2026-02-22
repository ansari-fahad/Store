const mongoose = require('mongoose');
const { Pool } = require('pg');

const dbType = process.env.DB_TYPE || 'mongodb';

let pgPool = null;

async function connectDB() {
  if (dbType === 'mongodb') {
    if (mongoose.connection.readyState >= 1) return;
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected 🚀');
    } catch (err) {
      console.error('MongoDB connection error:', err);
      throw err;
    }
  } else if (dbType === 'postgresql') {
    if (!pgPool) {
      pgPool = new Pool({
        connectionString: process.env.POSTGRES_URI,
        // Add SSL config if needed for cloud providers like Heroku/Render
        // ssl: { rejectUnauthorized: false } 
      });

      try {
        // Test connection
        const client = await pgPool.connect();
        console.log('PostgreSQL connected 🐘');
        client.release();
      } catch (err) {
        console.error('PostgreSQL connection error:', err);
        throw err;
      }
    }
  }
}

function getPgPool() {
  return pgPool;
}

module.exports = {
  connectDB,
  getPgPool,
  dbType
};
