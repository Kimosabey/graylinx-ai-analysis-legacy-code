const _ = require('lodash');
const uuid = require('uuid/v4');
const { error } = require('winston');
const model = require('./subsystem.model');
const bacnet=require('../../hvacBACnetClient');
const { property } = require('lodash');
const axiosc = require('axios');
const http = require('http');
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });
const keepAliveAgent = new http.Agent({ keepAlive: true });
const { OK, CREATED, ACCEPTED } = require('http-status');

const createSubsystem=(payload,callback)=>{
    var data={
      id: uuid(),
      name : payload.name,
      is_active : 1,
      tag:payload.tag?payload.tag:null,
      description:payload.description?payload.description:null,
      subsystem_type:payload.type?payload.type:null,
      status:payload.status?payload.status:null,
      parent_id:payload.parent_id?payload.parent_id:null,
      mac:payload.mac?payload.mac:null
    }
    model.createSubsystem(data, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
    });
}



// const insertSetpoint = (deviceId,data,callback) => {
//   model.userId((err,results)=>{
//     if(err){
//       callback(err)
//     }else{
//     let userid = results[0].id  
//   model.insertSetpoint(userid,deviceId,data,(error,res)=> {
//     if (error) {
//       callback(error);
//     } else {
//       let category = "GL_EVENT_CATEGORY_USER_INPUT";
//       let triggering_user = userid;
//       // console.log("in controller",category,deviceId,data.param_id,data.param_value,triggering_user)
//       model.setPointEvents(category,deviceId,data,triggering_user,(err,results)=>{
//         if(err){
//           callback(err)
//         }else{
//           callback(null,results)
          
//         }
//       })
//     }
//   })
// }
// })
// };



const insertBacnetCall=(deviceId,data,callback)=>{
               model.getdeviceData(deviceId,(error,result1)=>{
                 if(error){
                   callback(error)
                 }else{
                  //  console.log("------------",result1)
                  model.getdeviceData(result1[0].ss_parent,(error,result2)=>{
                    if(error){
                      callback(error)
                    }else{
                      // console.log("-----------------",result2)
                      let ip=result2[0].ss_address_value
                      model.getInstance(deviceId,data,(error,result3)=>{
                        if(error){
                          callback(error)
                        }else{
                          // console.log("--------------------------",result3)
                          //param_id":"ahu_on_off_sp"
                          let propArr=[]
                          propArr=[{ type: 4, value : data.param_value}];
                          // Write Functionality includes binaryvalue and priority
                          // http://localhost:7080/write/192.168.0.122/2:5/presentValue/0
                          // http://localhost:7080/write/192.168.0.122/5:5/presentValue/active/-/16
                          // http://localhost:7080/write/192.168.0.122/5:5/presentValue/inactive/-/16
                          // http://localhost:7080/write/192.168.10.30/5:60/presentValue/null/-/8
                          if(data.param_value != null){
                            let requestAdress=`http://localhost:7080/write/${ip}/${result3[0].ss_tag}:${result3[0].ss_address_value}/presentValue/${data.param_value}`
                            // console.log("--------------------->",requestAdress)                            
                            if(parseInt(result3[0].ss_tag)===5){
                              let data_param=data.param_value>0?'active':'inactive'
                              console.log(`----------------------------------binary--------------------------------------${result3[0].ss_tag}:${result3[0].ss_address_value}`)
                              let req=`http://localhost:7080/write/${ip}/${result3[0].ss_tag}:${result3[0].ss_address_value}/presentValue/${data_param}`
                              axios
                              .get(req+'/-/8')
                              .then((res)=>{
                                  //console.log(res.data)
                                  //res.status(OK)
                                  //callback(null,'ACCEPTED')
                                  model.insertSetpointBac(deviceId,data,(error,result)=>{
                                              if(error){
                                                callback(error)
                                              }else{
                                                callback(null,{"message":"ACCEPTED"})
                                              }
                                            })
                              })
                              .catch((err)=>{
                                //console.log(err)
                                callback(null,{"message":"please connect to network"})
                              })
                            }else{
                              axios
                              .get(requestAdress+'/-/8')
                              .then((res)=>{
                                 // console.log(res.data)
                                  //res.status(OK)
                                  //callback(null,'ACCEPTED')
                                  model.insertSetpointBac(deviceId,data,(error,result)=>{
                                    if(error){
                                      callback(error)
                                    }else{
                                      callback(null,{"message":"ACCEPTED"})
                                    }
                                  })
                              })
                              .catch((err)=>{
                               // console.log(err)
                                callback(null,{"message":"please connect to network"})
                              })
  
                            }
                          }else{
                            let requestAdress=`http://localhost:7080/write/${ip}/${result3[0].ss_tag}:${result3[0].ss_address_value}/presentValue/${data.param_value}`
                            axios
                            .get(requestAdress+'/-/8')
                            .then((res)=>{
                               // console.log(res.data)
                                //res.status(OK)
                                //callback(null,'ACCEPTED')
                                model.insertSetpointBac(deviceId,data,(error,result)=>{
                                  if(error){
                                    callback(error)
                                  }else{
                                    callback(null,{"message":"ACCEPTED"})
                                  }
                                })
                            })
                            .catch((err)=>{
                             // console.log(err)
                              callback(null,{"message":"please connect to network"})
                            })
                          }
                      //     if(data.param_id==="ahu_on_off_sp"){
                      //       console.log("priroty 8")
                      //      //propArr=[{ type: 1, value : data.param_value}];
                      //      bacnet.myWritePropertyNew(ip,2,100,85,propArr,(error,result4)=>{
                      //       //bacnet.myWritePropertyNew(ip,result3[0].ss_tag,result3[0].ss_address_value,85,propArr,(error,result4)=>{
                      //       if(error){
                      //         callback(null,{"message":"please connect to network"})
                      //       }else{
                      //         model.insertSetpointBac(deviceId,data,(error,result)=>{
                      //           if(error){
                      //             callback(error)
                      //           }else{
                      //             callback(null,{"message":"ACCEPTED"})
                      //           }
                      //         })
                      //       }
                      // })
                      //     }else{
                      //       propArr=[{ type: 4, value : data.param_value}];
                      //       bacnet.myWritePropertyNewsch(ip,result3[0].ss_tag,result3[0].ss_address_value,85,propArr,(error,result4)=>{
                      //         if(error){
                      //           callback(null,{"message":"please connect to network"})
                      //         }else{
                      //           model.insertSetpointBac(deviceId,data,(error,result)=>{
                      //             if(error){
                      //               callback(error)
                      //             }else{
                      //               callback(null,{"message":"ACCEPTED"})


                      //             }
                      //           })
                      //        }
                      //   })
                      //     }
                         
                        //  bacnet.myWriteProperty(ip,2,3,85,propArr,(error,result4)=>{
                          
                             
                       // })
                      }
                      })
                    }
                  })
                 }
               })
              }
         

const checkCommandStatus=(id,callback)=>{
model.checkCommandStatus(id,(err,res)=>{
  if(err){
    callback(err)
  }else{
    callback(null,res)
  }
})
}

const relinquishPriority=(id,callback)=>{
  model.relinquishPriority(id,(err,res)=>{
    if(err){
      callback(err)
    }else{
      callback(null,res)
    }
  })
  }
  


module.exports = {
    createSubsystem,
    insertBacnetCall,
    checkCommandStatus,
    relinquishPriority
  }
