const mysql = require('mysql');

const config = require('../Config/common');

const pool = mysql.createPool(config.mysql);
module.exports = { pool };
