const express = require("express");
const controller = require("./cpm.controller");

const router = express.Router();

router.get("/status", controller.getCpmStatus);

module.exports = router;
