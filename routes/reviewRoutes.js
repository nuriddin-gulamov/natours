// MODULES //
const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.unrestrictTo('user'),
    reviewController.setTourAndUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.unrestrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.unrestrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
