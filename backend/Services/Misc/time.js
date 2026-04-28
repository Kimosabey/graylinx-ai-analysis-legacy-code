const { OK } = require('http-status');
const express = require('express');
const { compareAsc, format, getUnixTime } = require('date-fns');
const router = express.Router();

router.get('/', (req, res, next) => {
  const time = getUnixTime(new Date());
  res.status(OK).json({
    systemTime: time
  });
});

module.exports = router;
