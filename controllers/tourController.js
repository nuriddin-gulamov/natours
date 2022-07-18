// MODULES //
const fs = require('fs');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

// TOURS DATA //
/*
const tours_simple = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
*/

// MIDDLEWARE //
/*
exports.checkID = (req, res, next, id) => {
  if (id > tours_simple.length - 1) {
    // return res.status(404).json({
    //   status: 'fail',
    //   message: 'Invalid ID',
    // });
  }
  next();
};
*/
/*
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    // return res.status(400).json({
    //   status: 'fail',
    //   message: 'Missing name or price',
    // });
  }
  next();
};
*/

// TOUR REQUEST HANDLERS //
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    /*
      {
        $match: {
          _id: { $ne: 'EASY' },
        },
      },
    */
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });

  // next();
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addField: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });

  // next();
});

// /tours-within/:distance/center/41.339397,69.225351/unit/:unit
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'You need to specify center latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'You need to specify center latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      distances,
    },
  });
});
