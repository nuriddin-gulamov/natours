// MODULES //
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

// REVIEW SCHEMA //
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 0.5,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a Tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// SETTING INDEXES //
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// MIDDLEWARE //
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// CALCULATING THE AVERAGE RATINGS //
reviewSchema.statics.calcAverageRatings = async function (tour) {
  const stats = await this.aggregate([
    { $match: { tour } },
    {
      $group: {
        _id: tour,
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);

  if (stats.length) {
    await Tour.findByIdAndUpdate(tour, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tour, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne();
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

// MODELLING THE SCHEMA //
const Review = mongoose.model('Review', reviewSchema);

// EXPORT //
module.exports = Review;
