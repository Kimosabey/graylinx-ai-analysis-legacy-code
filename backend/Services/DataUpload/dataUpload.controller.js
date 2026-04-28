const { CREATED, OK } = require('http-status');
const { validationResult } = require('express-validator');
const service = require('./dataUpload.service');
const csv = require('csv-parser');
const fs = require('fs');

const uploadFile = (req, res, next) => {
  const file = req.file.path;
  const results = [];
  fs.createReadStream(file)
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', () => {
      service.dataUpload(results, (error, result) => {
        if (error) {
          next(error);
        } else {
          res.status(CREATED).json({ id: result });
        }
      });
    });
};

module.exports = {
  uploadFile
};
