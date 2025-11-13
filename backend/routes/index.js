const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Real Estate Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      units: '/api/units'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;