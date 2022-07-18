// MODULES //
const express = require('express');

// TOUR CONTROLLER //
const tourController = require('../controllers/tourController');

// AUTH CONTROLLER //
const authController = require('../controllers/authController');

// REVIEW ROUTES //
const reviewRoutes = require('../routes/reviewRoutes');

// ROUTER //
const router = express.Router();

// NESTED REVIEWS ROUTE //
router.use('/:tourId/reviews', reviewRoutes);

// MIDDLEWARE //
// router.param('id', tourController.checkID);

// TOUR REQUESTS //
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.unrestrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours) // Get all tours
  .post(
    authController.protect,
    authController.unrestrictTo('admin', 'lead-guide'),
    tourController.createTour
  ); // Create Tour

router
  .route('/:id')
  .get(tourController.getTour) // Get tour
  .patch(
    authController.protect,
    authController.unrestrictTo('admin', 'lead-guide'),
    tourController.updateTour
  ) // Update tour
  .delete(
    authController.protect,
    authController.unrestrictTo('admin'),
    tourController.deleteTour
  ); // Delete Tour

// EXPORT //
module.exports = router;
