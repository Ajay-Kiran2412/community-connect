// server.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = require('./src/app');

const port = process.env.PORT || 5000;

// --- Database Connection ---
console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide password in logs

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    console.log('Database name:', mongoose.connection.db.databaseName);
    console.log('Collections:', mongoose.connection.collections);
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });