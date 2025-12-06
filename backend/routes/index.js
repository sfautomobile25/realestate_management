const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth');
const projectRoutes = require('./projects');
const buildingRoutes = require('./buildings');
const unitRoutes = require('./units'); // Make sure this exists
const customerRoutes = require('./customers');
const rentalRoutes = require('./rentals');
const paymentRoutes = require('./payments');
const hrRoutes = require('./hr');

// Mount routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/buildings', buildingRoutes);
router.use('/units', unitRoutes); // Make sure this is here
router.use('/customers', customerRoutes);
router.use('/rentals', rentalRoutes);
router.use('/payments', paymentRoutes);
router.use('/hr', hrRoutes);
router.use('/accounts', require('./accounts')); // ADD THIS LINE

module.exports = router;