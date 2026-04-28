const { CREATED, NOT_FOUND } = require("http-status");
// const path = require('path');
const { compareAsc, format } = require("date-fns");
const mysqldump = require("mysqldump");
const { backupDir } = require("../../Config/common");
const config = require("../../Config/common");
const os = require("os");
const { pool } = require("../../Database/pool");
const mysql_import = require("mysql-import");
const logger = require("../../Config/logger");
const { exec } = require("child_process");

const mysqlDbBackup = (req, res, next) => {
  const dir = os.homedir() + "/" + process.env.BACKUP_DIR;
  //const dir = process.env.BACKUP_DIR;
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const db_path = `${dir}/dbBackup${timestamp}.sql`;
  //console.log("db: ",db_path)
  try {
    mysqldump({
      connection: config.mysql,
      dumpToFile: db_path,
    });

    res.status(CREATED).json({ status: "created", path: db_path });
  } catch (e) {
    res.status(NOT_FOUND).json({ error: "error" });
  }
};

const mysqlDbRestore = (req, res) => {
  const filename = req.body.filename;
  const filePath = os.homedir() + process.env.BACKUP_DIR;
  let path = filePath + "/" + filename;
  console.log("kiran testing", path);

  pool.getConnection((error, connection) => {
    if (error) res.json(error);
    else if (connection) {
      const query = `drop database ${process.env.MYSQL_DATABASE_NAME}`;
      connection.query(query, (db_drop_error, result) => {
        if (result) {
          connection.query(
            `create database ${process.env.MYSQL_DATABASE_NAME}`,
            (db_create_error, result2) => {
              if (result2) {
                console.log("database created");
                const mydb_importer = mysql_import.config({
                  host: process.env.MYSQL_HOST,
                  user: process.env.MYSQL_USER,
                  password: process.env.MYSQL_PASSWORD,
                  database: process.env.MYSQL_DATABASE_NAME,
                  onerror: (err) => console.log(err.message),
                });
                console.log("testing");

                var t = mydb_importer.import(path);
                //console.log('created', t);

                if (t) {
                  setTimeout(() => {
                    res.status(CREATED).json("success");
                  }, 1000);
                }
              }
            }
          );
        }
      });
    }
  });
};

const mysqlDbReset = (req, res) => {
  pool.getConnection((conn_error, connection) => {
    if (conn_error) res.json(conn_error);
    else if (connection) {
      const query = `drop database ${process.env.MYSQL_DATABASE_NAME}`;
      // const query = `select * from device`;
      connection.query(query, (db_drop_error, result) => {
        if (result) {
          exec("node Database/schema.js", (error, stdout, stderr) => {
            if (error) {
              console.log(`error: ${error.message}`);
              return;
            }
            if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            // return; // callback(null, 'success');
          });
          // callback(null, 'success');
          res.status(CREATED).json("success");
        } else if (db_drop_error) {
          res.json(error);
        }
      });
    }
  });
};

module.exports = {
  mysqlDbBackup,
  mysqlDbRestore,
  mysqlDbReset,
};
