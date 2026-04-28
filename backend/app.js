const express = require("express");
const https = require("https");
Promise = require("bluebird");
const http = require("http");
const fs = require("fs");
var macaddress = require("macaddress");
const model = require("./Services/Auth/auth.modal");

const { port } = require("./Config/common");
const logger = require("./Config/logger");
const app = require("./Config/express");
const { exec } = require("child_process");
// // Initialize energy schema (safe to run multiple times)
// require("./Database/analytic_energy_schema");
// // Initialize GL analytics tables (gl_device_timeseries, gl_plant_timeseries, etc.)
// require("./Database/gl_analytics_schema");
// // Generate/update analytics stored procedures if config changed

// setTimeout(() => {
//   const { generateAndApply } = require("./Services/Gl_reports1/generateAggregationProcedures");
//   generateAndApply().catch(err => console.error("[Analytics] Procedure generation failed:", err));
// }, 3000);

// setTimeout(() => {
//   const { generateAndApply } = require("./Services/Gl_reports1/generateAggregationProcedures");
//   generateAndApply().catch(err => console.error("[Analytics] Procedure generation failed:", err));
// }, 3000);

const options = {
  key: fs.readFileSync(__dirname + "/Security/Cert/localhost.key", "utf-8"),
  cert: fs.readFileSync(__dirname + "/Security/Cert/localhost.crt", "utf-8"),
  passphrase: "george",
};
const mysql_user = process.env.MYSQL_USER;
const mysql_host = process.env.MYSQL_HOST;
const mysql_passcode = process.env.MYSQL_PASSWORD;
const mysql_db_name = process.env.MYSQL_DATABASE_NAME;

// macaddress.one( function (err,mac_address){
//   if(err) {
//   console.log("Couldn't find mac address!! stopping the process", err);
//   process.exit(1);
//   }else if (mac_address){
//     console.log("macc from system",mac_address)
//     model.checkMacAddress(mac_address, (err,result)=>{
//       if(err){
//           console.log("Mac address didn't match!! stopping the process",err)
//           process.exit(1);
//       }else{
//         console.log("Mac address matched started server")
//       }
//     })
//   }
// })

const httpsServer = https.createServer(options, app);

httpsServer.listen(port.https, () =>
  logger.info("Server running at Securely at Localhost"),
);

const httpApp = express();

httpApp.set("port", port.http);
httpApp.get("*", (req, res, next) => {
  res.redirect("https://" + req.headers.host + req.path);
});

http.createServer(httpApp).listen(httpApp.get("port"), () => {
  logger.info("Redirect Activated from " + httpApp.get("port"));
  // exec('mysql -uroot -pSenZ0pt@123 -e "SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,\'ONLY_FULL_GROUP_BY\',\'\'));"', (err, stdout, stderr) => {
  //   if (err) {
  //     console.error(`exec error: ${err}`);
  //     return;
  //   }
  // });
  model.setServerStatus(1, (err2, res2) => {
    if (err2) {
      console.log("error", err2);
    } else {
      exec(
        `mysql -u${mysql_user} -p${mysql_passcode} -e "SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"`,
        (err, stdout, stderr) => {
          if (err) {
            console.error(`exec error: ${err}`);
            return;
          } else {
            logger.info("sql mode updated");
          }
        },
      );
      exec(
        `mysql -u${mysql_user} -p${mysql_passcode} -e "SET global max_connections = 1000;"`,
        (err, stdout, stderr) => {
          if (err) {
            console.error(`exec error: ${err}`);
            return;
          } else {
            logger.info("maximum connections updated");
          }
        },
      );
      console.log("update is done");
    }
  });
});
//macaddress.one('eth1', function (err, mac_address) {
// macaddress.one( function (err, mac_address) {
//   if(err) {
//     console.log("Couldn't find mac address!! Stopping pm2 process.", err);
//     exec('sudo pm2 stop all');
//   } else if (mac_address) {
//     console.log("Mac address for vEthernet (Default Switch): %s", mac_address);
//     model.checkMacAddress(mac_address, (error, result) => {
//       if (error) {
//         console.log("Mac address didn't match!! Stopping pm2 processes.", error);
//         exec('sudo pm2 stop all');
//       } else {
//         console.log("Mac address matched, Starting the server");
//         http.createServer(httpApp).listen(httpApp.get('port'), () => {
//           logger.info('Redirect Activated from ' + httpApp.get('port'));
//               model.setServerStatus(1,(err2,res2)=>{
//                 if(err2){
//                   console.log("error",err2)
//                 }else{
//                   exec('mysql -uroot -pSenZ0pt@123 -e "SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,\'ONLY_FULL_GROUP_BY\',\'\'));"', (err, stdout, stderr) => {
//                     if (err) {
//                       console.error(`exec error: ${err}`);
//                       return;
//                     }
//                   })
//                   console.log("update is done")
//                 }
//               })

//           });

//       }
//     });
//   }
// });

module.exports = httpsServer;
