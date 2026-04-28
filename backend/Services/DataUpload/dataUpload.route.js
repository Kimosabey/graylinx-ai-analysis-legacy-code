const express = require('express');
const controller = require('./dataUpload.controller');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');
const path = require('path');

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, path.join(__dirname, '../Organization/'));
  },
  filename: function(req, file, callback) {
    var files = file.originalname;
    callback(null, files);
  }
});

const upload = multer({
  storage: storage
});

const router = express.Router();

router.post(
  '/',
  // authenticate,
  // permit('superAdmin'),
  //session,
  upload.single('file'),
  controller.uploadFile
);

module.exports = router;


