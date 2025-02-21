// routes/healthRoutes.js
const express = require('express');
const router = express.Router();

// Health check route
router.get('/', (req, res) => {
  res.status(200).json({ status: 'up' });
});

module.exports = router;
