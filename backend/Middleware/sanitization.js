const { body, check } = require('express-validator');

const userRegistration = [
  body('username')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('username').isLength({ min: 5, max: 15 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$"),
  body('password')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('password').isLength({ min: 8, max: 15 }).matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"),
  body('campus.id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('campus.id').isLength({ min: 36, max: 36 }),
  body('roleName')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('roleName').custom(value => value === 'user' || value === 'admin')
];

const updateUser = [
  body('username')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('username').isLength({ min: 5, max: 15 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$"),
  body('password')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('password').isLength({ min: 8, max: 15 }).matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"),
  body('campus.id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('campus.id').isLength({ min: 36, max: 36 }),
  body('roleName')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('roleName').custom(value => value === 'user' || value === 'admin'),
  body('status')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  // check('roleName').custom(value => value === 'user' || value === 'admin')
];

const userlogin = [
  body('credentials.username')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('credentials.password')
    .not()
    .isEmpty()
    .trim()
    .escape()
];

const resetPassword = [
  body('id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('new_password')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('reset')
    .not()
    .isEmpty()
    .trim()
    .escape()
    .toBoolean(),
    check('new_password').isLength({ min: 8, max: 15 }).matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")  
];

const forgotPassword = [
  body('username')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('key')
    .not()
    .isEmpty()
    .trim()
    .escape()
];

const orgReg = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max:20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$")
];


const editOrg = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max:20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$")
];

const campusReg = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('org.id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max: 20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$"),
  check('org.id').isLength({ min: 36, max: 36 })
];

const buildingReg = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('campus.id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max: 20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$"),
  check('campus.id').isLength({ min: 36, max: 36 })
];

const editBuildingName = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max: 20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$"),
];

const floorReg = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('building.id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max: 20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$"),
  check('building.id').isLength({ min: 36, max: 36 })
];

const editFloor = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max:20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$")
];

const zoneReg = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('floor.id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max: 20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$"),
  check('floor.id').isLength({ min: 36, max: 36 })
  // body('area.id')
  //   .not()
  //   .isEmpty()
  //   .trim()
  //   .escape(),
  // check('name').isLength({ min: 5, max: 20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$"),
  // check('area.id').isLength({ min: 36, max: 36 })
];

const areaReg = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('zone.id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max: 20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$"),
  check('zone.id').isLength({ min: 36, max: 36 })
];

const editZone = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max: 20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$")
];
const editArea = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max: 20 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$")
];

const deviceReg = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('type')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('metainfo.mac')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('installed_at.id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max: 20}).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$"),
  check('metainfo.mac').isLength({ min: 16, max: 16 }).matches("^[a-fA-F0-9]+$"),
  check('installed_at.id').isLength({ min: 36, max: 36 })
];

const editDevice = [
  body('name')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('name').isLength({ min: 5, max: 20}).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$")
];

const delId = [
  body('id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('id').isLength({ min: 36, max: 36 })
];


const updateDevice = [
  body('id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('area_id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('id').isLength({ min: 36, max: 36 }),
  check('area_id').isLength({ min: 36, max: 36 })
];

const updateDeviceXY = [
  body('id')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('id').isLength({ min: 36, max: 36 })
];

const createSchdeule = [
  body('data.title')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('data.action')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('data.intensity')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('data.start')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('data.end')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('data.title').isLength({ min: 5, max:10 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$")
];

const editSchdeule = [
  body('data.title')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('data.action')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('data.intensity')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('data.start')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  body('data.end')
    .not()
    .isEmpty()
    .trim()
    .escape(),
  check('data.title').isLength({ min: 5, max:10 }).matches("^[a-zA-Z][a-zA-Z0-9-_\\s]*$")
];

module.exports = {
  delId,
  orgReg,
  editOrg,
  zoneReg,
  areaReg,
  editZone,
  editArea,
  floorReg,
  editFloor,
  userlogin,
  campusReg,
  deviceReg,
  editDevice,
  buildingReg,
  editBuildingName,
  updateDevice,
  resetPassword,
  updateDeviceXY,
  createSchdeule,
  editSchdeule,
  forgotPassword,
  userRegistration,
  updateUser
};
