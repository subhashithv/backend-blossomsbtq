const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connected successfully');
    mongoose.connection.close(); // Close connection after success
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
