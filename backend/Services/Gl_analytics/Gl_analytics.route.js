const express = require('express');
const controller = require('./Gl_analytics.controller');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');

const router = express.Router();

router.get(
    '/subsystemId/:id',
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.getSubsystemId
  );

  router.get(
    '/:id/:param/getxmapdatazoneid',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getxmapdatazoneid
  );

  router.get(
    '/:id/:device/getdevicedatazoneid',
    authenticate,
    permit('admin','technician'),
    session,
  
    inputSanitization.orgReg,
    controller.getdevicedatazoneid
  );

  router.get(
    '/:id/gethvacmapdatazoneid',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.gethvacmapdatazoneid
  );

  router.get(
    '/:id/:param/getlast24hr',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getlast24hr
  )

  router.get(
    '/:zoneId/getAhuActualExpected',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getAhuActualExpected
  )

  router.get(
    '/:deviceId/getAhuData',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getAhuData
  )

  router.get(
    '/:zoneId/getAhuActualExpectedNew',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getAhuActualExpected1
  )

  router.get(
    '/:deviceId/getAhuDataLast1Hr',
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.getAhuDataLast1Hr
  )
  
  router.get(
    '/:deviceId/getVavDataLast1Hr',
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.getVavDataLast1Hr
  )

  router.get(
    '/:floorId/getEmsData',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getEmsData
  )

  router.get(
    '/:deviceId/getEmsDeviceData',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getEmsDeviceData
  )

  router.get(
    '/:deviceId/getEnergyDataLast1Hr',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getEnergyDataLast1Hr
  )
  
  router.get(
    '/:deviceId/:day/ems24hoursdata',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.ems24hoursdata
  )

  router.get(
    '/:deviceId/:day/ems7daysdata',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.ems7daysdata
  )

  router.get(
    '/:deviceId/getUpsDeviceData',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getUpsDeviceData
  )

  router.get(
    '/:deviceId/getUpsDataLast1Hr',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getUpsDataLast1Hr
  )

  router.get(
    '/:deviceId/getcsuDataLast1Hr',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getcsuDataLast1Hr
  )

  router.get(
    '/:zoneId/:deviceType/getDeviceTimeSeriesData',
    authenticate,
    permit('admin','technician'),
    session,
  
    // inputSanitization.orgReg,
    controller.getDeviceTimeSeriesData
  );

  router.get(
    '/:deviceId/getChillerDataLast1Hr',
    // authenticate,
    // permit('admin','technician'),
    // session,
    // inputSanitization.orgReg,
    controller.getChillerDataLast1Hr
  )

  router.get(
    '/:deviceId/getCoolingTowerDataLast1Hr',
    // authenticate,
    // permit('admin','technician'),
    // session,

    // inputSanitization.orgReg,
    controller.getCoolingTowerDataLast1Hr
  )

  router.get(
    '/:deviceId/commonGraphApiForAll',
    // authenticate,
    // permit('admin','technician'),
    // session,

    // inputSanitization.orgReg,
    controller.commonGraphApiForAll
  )

  router.get(
    '/:ss_type/:metric_id/:default/metricGraphApiForAll',
    // authenticate,
    // permit('admin','technician'),
    // session,

    // inputSanitization.orgReg,
    controller.metricGraphApiForAll
  )


  router.get(
    '/:id/:device/newgetdevicedatazoneid',
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.getdevicedatabyzoneid
  );

  router.post(
    '/:deviceId/:type/:interval/getDeviceDataLast1Hr',
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.getDeviceDataLast1Hr
    
  )

  
  router.get(
    '/getEquipmentTypeList',
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.getEquipmentList
  )

  router.get(
    '/:deviceId/:type/getParameterTypes',
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,

    controller.getParameterTypes
  )

  // router.get(
  //   '/:deviceId/getEquipmentIdCurrentParameters',
  //   controller.getEquipmentIdCurrentParameters
  // )


  router.get(
    '/:floorID/:eqType/getTempreature',
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.getTemperature
  )

  router.post(
    '/:id/deviceParametersReports',
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.deviceParametersReports
  )

  // router.get(
  //   '/dailyenergyconsumptionforallem',
  //   // authenticate,
  //   // permit('admin','technician'),
  //   // session,
  
  //   // inputSanitization.orgReg,
  //   controller.dailyenergyconsumptionforallem
  // )

  // hourly energy consumption by equepments
 router.get(
    '/energyConsumptionChart',
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.energyConsumptionChart
  )

 router.get(
    '/assetWiseEnergy',
   
    // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.getAssetHealthEnergy
  )

   router.get(
    '/heatMapEnergy',
    controller.getEnergyHeatmap
  )



  router.get(
  '/assetHealthAlarm',
  controller.getAssetHealth
);






  module.exports = router;