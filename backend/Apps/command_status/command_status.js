const _ = require('lodash');
const schedule = require('node-schedule');
const async = require('async');
const controller = require('./command_status.controller');
const modellight=require('../../Services/Lights/light.model')
const uuid = require('uuid/v4');
const axiosc = require('axios');
const https = require('https');
const logger = require('../../Config/logger');
const { response } = require('express');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });


schedule.scheduleJob('*/10 * * * * *', () => {
  async.waterfall(
    [
      callback => {
        controller.command_status((err, result) => {
          if (err) {
            callback(err);
          } else {
            callback(err, result);
          }
        });
      },
      (response, callback) => {
        if (response.length !== 0) {
            const data=[]
                modellight.getmaxcommand_id((error,max_cmdId)=>{
                    if(error){
                            callback(error)
                    }else{
                        let i=0
                         response.forEach(each=>{
                             i++
                             formatobj={}
                             formatobj.id=uuid()
                             formatobj.mac=each.device_mac
                             formatobj.batch_id=each.batch_id
                             formatobj.cmd=max_cmdId+i
                             formatobj.counter=parseInt(each.counter)+1
                             formatobj.gatewayip=each.gatewayip
                             formatobj.mode=each.mode
                             formatobj.intensity=parseInt(each.intensity)
                             formatobj.payload=JSON.parse(each.payload)
                             formatobj.payload.cmd=formatobj.cmd
                             formatobj.status="failed_trying"
                             formatobj.payload=JSON.stringify(formatobj.payload)
                             data.push(formatobj)
                             if(response.length==i){
                                 modellight.commandData(data,(error,result)=>{
                                     if(error){
                                         callback(error)
                                     }else{
                                         callback(null,data)
                                     }
                                 })
                               
                             }                            
                         }
                         )
                    }
                })
           
        } else {
          callback('empty');
        }
      },
      (response,callback)=>{
          if(response.length !== 0){
              const data=[]
              let i=0
              response.forEach(each=>{
                    const res={}
                    if(each.mac.substring(0, 4)==="50dc"){
                           let daliobj={}
                           let daliarr=[]
                           daliarr.push(JSON.parse(each.payload))
                           daliobj.mode=each.mode
                           daliobj.intensity=each.intensity
                           daliobj.dali=daliarr
                           res.DALI=daliobj
                           res.ip=each.gatewayip
                           data.push(res)
                           i++
                           if(i==response.length){
                               callback(null,data)
                           }
                    }else{
                        let wacobj={}
                        let wacarr=[]
                        wacarr.push(JSON.parse(each.payload))
                        wacobj.mode=each.mode
                        wacobj.intensity=each.intensity
                        wacobj.wac=wacarr
                        res.WAC=wacobj
                        res.ip=each.gatewayip
                        data.push(res)
                        i++
                        if(i==response.length){
                            callback(null,data)
                        }
                    }
              })
          }
      }
    ],
    (err, response) => {
      if (err) {
        console.log('Schedule Empty');
      } else {
        if (response.length !== 0) {
          console.log("final_resp===============================", response)
        //   let ino = 0;
        //   let eno = 0;
          response.forEach(each => {
            // console.log(each.DALI)
            // console.log(JSON.stringify(each.WAC))
            const payload = {
              DALI: each.DALI,
              WAC: each.WAC
            }     
            console.log("payload1: ", JSON.stringify(payload))
            axios
                    .post(`https://${each.ip}/api/WLMSGroupControl`, payload)
                    .then(() =>
                      console.log(
                        `${new Date()} Status: successs`
                      )
                    )
                    .catch(() =>
                      console.log(
                        `${new Date()} Status: failure, action : MANUAL MODE`
                      )
                    )
          });
        }
      }
    }
  );
});
