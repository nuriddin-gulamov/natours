// MODULES //
const express = require('express');

// CONTROLLER //
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// USER REQUESTS //
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.unrestrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers) // Get all users
  .post(userController.createUser); // Create user

router
  .route('/:id')
  .get(userController.getUser) // Get user
  .patch(userController.updateUser) // Update user
  .delete(userController.deleteUser); // Delete user

// Export
module.exports = router;
