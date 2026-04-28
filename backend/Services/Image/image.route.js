const express = require('express');
const multer = require('multer');
const path = require('path');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');
const controller = require('./image.controller');

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, path.join(__dirname, '../../Images/'));
  },
  filename: function(req, file, callback) {
    var files = file.originalname;
    callback(null, files);
  }
});

const uploadImages = multer({
  storage: storage,
  fileFilter: function(req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
      ext !== '.jpg' &&
      ext !== '.jpeg' &&
      ext !== '.JPG' &&
      ext !== '.JPEG'
    ) {
      return callback(new Error('Only jpg files are allowed'));
    }
    if (file.originalname.length > 20) {
      return callback(new Error('Filename very large'));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

const router = express.Router();

router.post(
  '/upload',
  authenticate,
  permit('superAdmin'),
  session,
  uploadImages.single('file'),
  controller.uploadImage
);

module.exports = router;
