const axiosc = require('axios');
const http = require('http');
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });
const logger = require('./logger');
function executePbsReq(req,callback){
  axios
  .get(req)
  .then((data) => {
    if(data.status===200){
      logger.info("Command reached PBS.")
      callback(null,data.status)
    }
  })
  .catch((err)=>{
    logger.info("Please Run PBS.")
    callback(null);
  })
}

// function prepareUrl(data){
//   //http://localhost:7080/write/156:0x000000000003/5:1004/presentValue/inactive
//   const value=data.action===1?'active':data.action===0?'inactive':data.action
//   req=`http://localhost:7080/write/${data.data.ip}/${data.data.objtype}:${data.data.objInstance}/presentValue/${value}`
//   return(req)
// }

module.exports={
  executePbsReq
}