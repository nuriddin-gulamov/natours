// MODULES //
const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');
const User = require('./userModel');

// SAVE TOUR //
/*
const saveTour = async givenTour => {
  try {
    const doc = await givenTour.save();
    console.log(doc);
  } catch (err) {
    console.error(err);
  }
};
*/

// CREATING SCHEMA //
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [
        10,
        'Tour must be equal or must have more than 10 characters',
      ],
      maxlength: [
        40,
        'Tour must be equal or must have less than 40 characters',
      ],
      // validate: [validator.isAlpha, 'A Tour name must only contain letters'],F
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Tour must be equal or must have more rating than 0.5'],
      max: [5, 'Tour must be equal or must have less rating than 5.0'],
      set: value => Math.round(value * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          // console.log(this._update);
          return val < this._update.$set.price;
        },
        message: 'Discount ({VALUE}) should be less than the price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    images: [String],
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      selected: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtual: true },
    toObject: { virtual: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// VIRTUAL POPULATE (CONNECTION REVIEWS) //
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() //
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/*
tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/

// QUERY MIDDLEWARE: //
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `Query middleware was done in ${Date.now() - this.start} milliseconds!`
  );
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// AGGREGATION MIDDLEWARE //
/*
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
*/

const Tour = mongoose.model('Tour', tourSchema);

// EXPORT //
module.exports = Tour;
