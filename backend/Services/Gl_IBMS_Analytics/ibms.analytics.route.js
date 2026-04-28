const express = require('express');
const controller = require('./ibms.analytics.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');

const router = express.Router();

router.post('/device_faults',
//   authenticate,
//   permit('superAdmin', 'admin', 'user'),
//   session,
  controller.device_faults
);

router.post('/single_device_faults',
  // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
  controller.single_device_faults);

router.post('/benchmarking',
  // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
    controller.benchmarking);
// router.get(
//   '/cards/occupancy',
//   authenticate,
//   permit('superAdmin', 'admin', 'user'),
//   session,
//   controller.occupancyCards
// );
// router.get(
//   '/chart/occupancy',
//   authenticate,
//   permit('superAdmin', 'admin', 'user'),
//   session,
//   controller.occupancyCharts
// );

router.post('/getenergyConsumption',
  // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
  controller.getEnergyConsumption
  
)

router.post('/getenergy',
  // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
  controller.getEnergy
)



router.post('/getEnergyTemp',
  // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
  controller.getEnergyTemperature
)

router.post('/getrunhour',
  // authenticate,
    // permit('admin','technician'),
    // session,
  
    // inputSanitization.orgReg,
  controller.getRunhour
)


router.post(
  '/getfloorzoneEnergydata',
  // authenticate,
  // permit('admin','technician'),
  // session,

  // inputSanitization.orgReg,
  controller.getfloorzoneEnergydata
);


module.exports = router;
