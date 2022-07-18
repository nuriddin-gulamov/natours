// MODULES //
const Review = require('../models/reviewModel');
const factory = require('../controllers/handlerFactory');
// const catchAsync = require('../utils/catchAsync');

// SET TOUR AND USER IDS MIDDLEWARE //
exports.setTourAndUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.tour = req.params.id;
  next();
};

// REVIEW METHODS //
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
