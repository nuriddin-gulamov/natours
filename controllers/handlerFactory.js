// MODULES //
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const API_Features = require('../utils/apiFeatures');

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // EXECUTING QUERY //
    const features = new API_Features(Model.find(), req.query)
      .filter() // Filtering results
      .sort() // Sorting results
      .limitFields() // Limiting fields
      .paginate(); // Paginating results

    // const documents = await features.query.explain();
    const documents = await features.query;

    // SEND RESPONSE //
    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: {
        documents,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;

    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        ...document._doc,
        ...document.$$populatedVirtuals,
      },
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        newDocument,
      },
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const updatedDocument = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDocument) {
      return next(new AppError('No Document found with that ID', 404));
    }

    res.status(201).json({
      status: 'success',
      data: {
        updatedDocument,
      },
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No Document found with given ID'), 404);
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
