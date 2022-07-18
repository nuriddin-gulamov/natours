const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

// Basic
router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

// Authentication
router.get('/login', authController.isLoggedIn, viewController.login);

// Unsupported pages
router.get('/unsupported', viewController.unsupported);

module.exports = router;
