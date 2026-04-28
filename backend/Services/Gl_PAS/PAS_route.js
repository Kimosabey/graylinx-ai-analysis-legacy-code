const express = require('express');
const controller = require('./PAS_controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');
const router = express.Router();

router.post('/gl_pas_res',controller.responseFromFDD)
// router.post('/gl_pas_model_res',controller.modelResponseFromFDD)

module.exports=router