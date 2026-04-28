const { CREATED, OK, ACCEPTED } = require('http-status');
const { validationResult } = require('express-validator');
const logger = require('../../Config/logger');
const service = require('./Gl_reports.service');



const generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const filePath = await service.generateExcelReport(
      startDate,
      endDate
    );

    res.json({
      message: 'Report generated and emailed successfully',
      filePath
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function getChiller1Data(req, res, next) {
  try {
     const { startDate, endDate } = req.query;
    const result = await service.getChiller1Data(
      startDate,
      endDate
    );

   
    res.send({
      success: true,
      from_date: startDate,
      to_date: endDate,
      data: result
    });

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}

async function getChiller2Data(req, res, next) {
  try {
     const { startDate, endDate } = req.query;
    const result = await service.getChiller2Data(
      startDate,
      endDate
    );

   
    res.send({
      success: true,
      from_date: startDate,
      to_date: endDate,
      data: result
    });

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}

async function getPlantData(req, res, next) {
  try {
     const { startDate, endDate } = req.query;
    const result = await service.getPlantData(
      startDate,
      endDate
    );

   
    res.send({
      success: true,
      from_date: startDate,
      to_date: endDate,
      data: result
    });

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}

async function getBtuMeterData(req, res, next) {
  try {
     const { startDate, endDate } = req.query;
    const result = await service.getBtuMeterData(
      startDate,
      endDate
    );
    
    res.send({
      success: true,
      from_date: startDate,
      to_date: endDate,
      data: result
    });

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}

async function getSummaryData(req, res, next) {
  try {
     const { startDate, endDate } = req.query;
    const result = await service.getPlantSummary(
      startDate,
      endDate
    );

   
    res.send({
      success: true,
      from_date: startDate,
      to_date: endDate,
      data: result
    });

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}






module.exports = {
  generateReport,
  getChiller1Data,
  getChiller2Data,
  getPlantData,
  getBtuMeterData,
  getSummaryData
}