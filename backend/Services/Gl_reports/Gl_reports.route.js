const express = require('express');
const controller = require('./Gl_reports.controller');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');

const router = express.Router();

router.post('/generate-report', controller.generateReport);

router.get('/getChiller1Data', controller.getChiller1Data);

router.get('/getChiller2Data', controller.getChiller2Data);

router.get('/getPlantData', controller.getPlantData);

router.get('/getBtuMeterData', controller.getBtuMeterData);

router.get('/getSummaryData', controller.getSummaryData);




  module.exports = router;