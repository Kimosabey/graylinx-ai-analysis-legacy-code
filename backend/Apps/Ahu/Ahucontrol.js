const _ = require('lodash');
const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const lightmodel=require('../../Services/Lights/light.model')
const axiosc = require('axios');
const https = require('https');
const logger = require('../../Config/logger');
const { response } = require('express');
const { getCipherInfo } = require('crypto');
const { parseInt, update } = require('lodash');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const bacnet=require('../../hvacBACnetClient')


schedule.scheduleJob('*/10 * * * * *',()=>{
    async.waterfall(
        [
            callback => {
                console.log("cronjob running",new Date())
                controller.getSetPoint((err, result) => {
                  if (err) {
                    callback(err);
                  } else {
                    callback(err, result);
                  }
                });
              },(response,callback)=>{
                const nextData=[]
                let index=0
                response.forEach((Element)=>{
                    controller.getInOutairtemperature((Element.ss_id),(err,result)=>{
                        res={}
                        if(err){
                           console.log(err) 
                          callback(err);
                        }else{
                         
                           //  console.log(response)
                            const outsidetemperatureData=result.filter(e => e.param_id === 'ahu_out_air_temperature').map(e=>parseInt(e.param_value))
                           const insidetemperatureData=result.filter(e => e.param_id === 'ahu_in_air_temperature').map(e=>parseInt(e.param_value))
                           const supplytemperatureData=result.filter(e => e.param_id === 'ahu_supply_air_temperature').map(e=>parseInt(e.param_value))
                           const chwt=result.filter(e => e.param_id === 'ahu_chill_water_temperature').map(e=>parseInt(e.param_value))
                            res["process_id"]=Element.process_id
                            res["setpoint"]=Element.param_value
                            res["ss_id"]=Element.ss_id
                            res["ss_parent"]=Element.ss_parent
                            res["proportional_gain"]=parseFloat(Element.proportional_gain)
                            res["calibration_factor_k1"]=parseInt(Element.calibration_factor_k1)
                            res["calibration_factor_k2"]=parseInt(Element.calibration_factor_k2)
                            res["integral_gain"]=parseFloat(Element.integral_gain)
                            res["intemperature"]=insidetemperatureData.reduce((a, b) => a + b, 0)/insidetemperatureData.length;
                            res["outtemperature"]=outsidetemperatureData.reduce((a, b) => a + b, 0)/outsidetemperatureData.length;
                            res["supplytemperature"]=supplytemperatureData.reduce((a, b) => a + b, 0)/supplytemperatureData.length;
                            res["chillwatertemperature"]=chwt.reduce((a, b) => a + b, 0)/chwt.length;
                            index++
                          nextData.push(res)
                          if(index==response.length){
                              callback(null,nextData)
                          }
                        }
                    })
                })

             }
            ,(response,callback)=>{
                const nextData=[]
                let index=0
                response.forEach(Element=>{
                    controller.getValvePosition(Element.ss_id,(error,result)=>{
                        if(error){
                            callback(error)
                        }else{
                            if(result.length>0){
                                let ravData=result.filter(e => e.param_id === 'return_air_valve').map(e=>parseInt(e.param_value))
                                let oavData=result.filter(e => e.param_id === 'out_air_valve').map(e=>parseInt(e.param_value))
                                let chwvData=result.filter(e => e.param_id === 'chill_water_valve').map(e=>parseFloat(e.param_value))
                                let rav=ravData.reduce((a, b) => a + b, 0)/ravData.length;
                                let oav=oavData.reduce((a, b) => a + b, 0)/oavData.length;
                                let chwv=chwvData.reduce((a, b) => a + b, 0)/chwvData.length;
                                let mat=Element.intemperature/100*rav+Element.outtemperature/100*oav
                                let csp=mat-Element.chillwatertemperature/100*chwv
                                let error=Element.setpoint-csp
                                console.log("supply air temperature",csp)
                                if((csp >= parseInt(Element.setpoint)-0.5) && (csp <= parseInt(Element.setpoint)+0.5)){
                                    controller.updateSpm(Element.process_id,(uerror,uresult)=>{
                                        if(uerror){
                                            callback(error)
                                        }else{ 
                                            controller.getbactnetDAta(Element.ss_id,(error,result)=>{
                                                if(error){
                                                        callback(error)
                                                }else{
                                                    let mytarget= result[0].ss_address_value
                                                    let objType= result[1].ss_tag
                                                    let objInstance = result[1].ss_address_value
                                                    let propertyId =85 
                                                    let propertyArray=[{ type: 4, value: chwv}];
                                                    console.log('Calling BACnet Write: ',mytarget, objType, objInstance, propertyId,propertyArray);
                                                    bacnet.myWriteProperty(mytarget, objType, objInstance, propertyId,propertyArray, (err,value)=>{
                                                        console.log('Coming from BACnet Write')
                                                       if(err){
                                                           callback(err)
                                                       }else{
                                                           console.log(value[0].value)
                                                           console.log(value[0])
                                                        //    callback(null,value)
                                                        presentvalue = value[0].value
                                                        controller.insertChwv(Element.ss_id,presentvalue,(error,result)=>{
                                                            if(error){
                                                                callback(error)
                                                            }else{
                                                                callback(null,result);  
                                                            }
                                                        })
                                                       }
                                                       
                                                    });
                                                    
                                                }
                                       
                                       
                                            })                                            
                                        }
                                    })
                               }else{
                                   console.log("error",error)
                                   console.log("ele pgain",Element.proportional_gain)
                                   console.log("k2",Element.calibration_factor_k2)
                                    let pek=Element.proportional_gain*error*Element.calibration_factor_k2
                                    console.log("pek-------",pek)
                                    let ied=Element.integral_gain*error*1
                                    console.log("---------ied",ied)
                                    let change_chwv=chwv+pek+ied
                                         controller.updateChwv(change_chwv,Element.ss_id,(error,result)=>{
                                            if(error){
                                                callback(error)
                                            }else{
                                                console.log("make a commad to change chill water valve to ",change_chwv)
                                                console.log("=======================================================")
                                            }
                                        })

                                    // if(parseInt(Element.setpoint)<csp){
                                    //     chwv=chwv+10
                                    //     controller.updateChwv(chwv,Element.process_id,(error,result)=>{
                                    //         if(error){
                                    //             callback(error)
                                    //         }else{
                                    //             console.log("make a commad to change chill water valve to ",chwv)
                                    //         }
                                    //     })
                                    // }
                                    // else{
                                    //     chwv=chwv-10
                                    //     controller.updateChwv(chwv,Element.process_id,(error,result)=>{
                                    //         if(error){
                                    //             callback(error)
                                    //         }else{
                                    //             console.log("updated")
                                    //             console.log("make a commad to cahnage chill water valve to ",chwv)
                                    //         }
                                    //     })

                                    // }

                               }

                            }else{
                                //if therer is no valve value in DB
                                let oav=15
                                let rav=85
                                let chw=10
                                let mat=Element.intemperature/100*85+Element.outtemperature/100*15
                                let csp=mat-Element.chillwatertemperature/100*10
                                if(csp >= parseInt(Element.setpoint-0.5) && csp <= parseInt(Element+0.5)){
                                        controller.updateSpm(Element.process_id,(uerror,uresult)=>{
                                            if(uerror){
                                                callback(error)
                                            }else{
                                                console.log("updated");
                                                // callback(null,"done")
                                            }
                                        })
                                }else{
                                   controller.insertARC(oav,rav,chw,(error,callback)=>{
                                       if(error){
                                           callback(error)
                                       }else{
                                          console.log("inserted")
                                       }
                                   })
                                }
                            }
                        }

                    })

                })
            }
        ],
        (err,response)=>{
                console.log("data-----------------------final data",response)
        }

    )
})
