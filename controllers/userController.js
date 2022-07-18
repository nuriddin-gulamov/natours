// MODULES //
const { ConnectionStates } = require('mongoose');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

// FILTERING FUNCTION //
const filterObj = (obj, ...allowedFields) => {
  const filteredObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) filteredObj[el] = obj[el];
  });
  return filteredObj;
};

// USER REQUEST HANDLERS //
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead!',
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user wants to update the password
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates, please use /updateMyPassword for password updates.',
        400
      )
    );

  // 2) Update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser,
    },
  });
});

// DELETE THE CURRENT USER //
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
