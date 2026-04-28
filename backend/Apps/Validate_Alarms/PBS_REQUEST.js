const axiosc = require('axios');
const http = require('http');
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });


const sendRequestToFdd = (req_payload,payload,callback)=>{
    console.log("payload to be sent for pbs",payload)
    // let requestadress = `http://localhost:7176/f1/f2?service=FDD&feature=valve_stuck`
    // let requestadress = `${req_payload.pas_port}/f1/f2?service=${req_payload.pas_service}&feature=${req_payload.pas_feature}`
    let requestaddress = `http://localhost:7176/f1/f2?service=${req_payload.service}&feature=${req_payload.feature}`;
    console.log("my final url for PAS",requestaddress)
    axios
    .post(requestaddress,payload)
    .then((res)=>{
        callback(null,res.data.request_uuid)
        // callback(null,res.data.param)
    })
    .catch((err)=>{
      callback(null,"Error from FDD")
    })
  }

  module.exports={
    sendRequestToFdd
  }