const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('./auth.controller');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');
const router = express.Router();

const createAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many failed login attempted , please try again after an 15'
});

router.post('/logout', controller.logout);
router.post('/admin', controller.superAdmin);
router.post('/admin/force-login', controller.superAdminForceLogin);
router.post('/force-login', controller.userForceLogin);

router.post(
  '/login',
  // createAccountLimiter,
  // inputSanitization.userlogin,
  controller.login
);
router.post(
  '/forgot-password',
  inputSanitization.forgotPassword,
  controller.resetForgottenPassword
);

router.get(
  '/qa/:id',
  authenticate,
  permit('superAdmin', 'admin', 'user','cluster_manager'),
   session,
  controller.secretKey
);
router.post(
  '/qa/:id',
  authenticate,
  permit('superAdmin', 'admin', 'user','cluster_manager'),
  session,
  controller.updateSecretKey
);
router.post(
  '/register',
  authenticate,
  permit('superAdmin', 'admin', 'user','cluster_manager','hq_manager'),
  session,
  inputSanitization.userRegistration,
  controller.registerUser
);

router.post(
  '/update-user',
  // authenticate,
  // permit('superAdmin', 'admin', 'user','cluster_manager'),
  // session,
  // inputSanitization.updateUser,
  controller.updateUser
);

router.post(
  '/delete-user',
  // authenticate,
  // permit('superAdmin', 'admin', 'user','cluster_manager'),
  // session,
  controller.deleteUser
);
router.post(
  '/reset-password',
  authenticate,
  permit('superAdmin', 'admin', 'user','cluster_manager'),
  //session,
  inputSanitization.resetPassword,
  controller.resetPassword
);
router.get(
  '/users',
  authenticate,
  permit('superAdmin', 'admin', 'user','cluster_manager'),
  session,
  // inputSanitization.resetPassword,
  controller.getUsers
);

module.exports = router;
