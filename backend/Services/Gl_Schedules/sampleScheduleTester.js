// var parser = require('cron-parser');
// var input='0 7 * * 0-4';
// console.log("input",input)
// var interval = parser.parseExpression(input);
// var fields = JSON.parse(JSON.stringify(interval.fields)); // Fields is immutable
// console.log("fields",fields)
// fields.hour = [8];
// fields.minute = [29];
// fields.dayOfWeek = [1,3,4,5,6,7];
// var modifiedInterval = parser.fieldsToExpression(fields);
// var cronString = modifiedInterval.stringify();
// console.log(cronString);
const schedule = require('node-schedule');
const model=require('./schedule.model')
const de=require('../../CPM_modular/decision_engine')
const dataHandler=require('../../CPM_modular/CPM_Data_Handler')
let scheduleIdCtf={}
let loader=false;
// const axiosc = require('axios');
// const https = require('https');
// const httpsAgent = new https.Agent({ rejectUnauthorized: false });
// const axios = axiosc.create({ httpsAgent });



const createMockResponse = () => {
  return {
      status: (code) => {
          return {
              json: (data) => {
                  console.log(`Response Status: ${code}`);
                  console.log('Response Data:', data);
              },
          };
      },
  };
};

function scheduleJob(name, ctfArg) {
    console.log("ctf",ctfArg,"name",name);
    console.log("job list:",scheduleIdCtf)
    const concurrent = dataHandler.getSiteSpecificDataItem(['allowConcurrent']);
   const job= schedule.scheduleJob(ctfArg, function(){
        console.log(`sch id job to perform ${scheduleIdCtf[ctfArg]}`)
        model.getJobDetails(scheduleIdCtf[ctfArg],(err,res)=>{
            console.log(`job to be performed`,JSON.stringify(res));
            res.forEach(async(ele)=>{
              let action={}
              action["gl_command"]=ele.command
              action["param_id"]=ele.param_name
              action["value"]=ele.param_value
              if(ele.zone_id!=null && ele.zone_id.split(",").length>0 && concurrent === true){
                console.log("LOOPING IN ZONE")
                //passing multiple zone_id to locationIdsToDevice() and get all device data in array[{},{}] stored in deviceDetails
                let deviceDetails= await locationIdsToDevice(ele.zone_id.split(","),action);
                console.log("!!!!!!!!!!!!!!!!!!!AFTER locationIdsToDevice!!!!!!!!!!!!!!!!!!!!!!!@@@@@@@@@@@@@@@@@@@@@@@@@@",deviceDetails.length)
                deviceDetails.forEach((id,i)=>{
                  setTimeout(() => {
                  let data={}
                  console.log("id in data",id)
                  data["body"]=id
                  // const response=createMockResponse()
                  const response = () => {
                    return {
                        status: (code) => {
                            return {
                                json: (data) => {
                                    console.log(`Response Status: ${code}`);
                                    console.log('Response Data:', data);
                                },
                            };
                        },
                    };
                  };
                  console.log("mock res in sample test---------------------->",JSON.stringify(response))
                  // axios.post('https://localhost/v1/newapis/controlaction',data)
                  // .then(response => {     // Handle success
                  //     console.log('response',response.Data.status);
                  // })   .catch(error => {     // Handle error
                  //     console.error('Error:', error);   
                  // });
                  de.hdlEquipmentAction(data,response());
                  // de.hdlEquipmentAction(data, response())
                  //   .then(({ status, data }) => {
                  //     console.log("Status:in response", status);
                  //     console.log("Data:in response", data);
                  //   })
                  //   .catch(error => {
                  //     console.error("Error:", error);
                  //   });
                  // console.log(`-----------------------------------------@@@@@@@@@@@@@@result after schdule call ${JSON.stringify(result)}`);              
                  // de.hdlEquipmentAction(data);
                  }, 100);
                })
              // }
              }
              else if(ele.zone_id!=null && ele.zone_id.split(",").length>0 && concurrent===false){
                console.log("==========Zone Schedule for CPM Auto Mode=============")
                let CPMCombination = ele.zone_id;
                let startCPMScenario = ele.command ==="TURN_ON"?"START_AIR_COOLED_CHILLER_SYSTEM_MODULAR":"STOP_AIR_COOLED_CHILLER_SYSTEM_MODULAR";
                if(CPMCombination === null) {
                  payload = {
                        "body":
                        {	
                          "startCPMScenario":startCPMScenario
                        }
                      }
                }else{
                  payload = {
                    "body":
                    {	
                      "startCPMScenario":startCPMScenario,
                      "CPMCombination": CPMCombination
                    }
                  }
                }
                const response = () => {
                  // return {
                  //     status: (code) => {
                      return {
                        json: (data) => {
                          // console.log(`Response Status: ${code}`);
                          console.log('Response Data:====', data);
                        },
                      };
                  //     },
                  // };
                  };
								de.processMyCpmNotification(payload,response());
                
                //passing multiple zone_id to locationIdsToDevice() and get all device data in array[{},{}] stored in deviceDetails
                // let deviceDetails= await locationIdsToDevice(ele.zone_id.split(","),action);
                // console.log("!!!!!!!!!!!!!!!!!!!AFTER locationIdsToDevice!!!!!!!!!!!!!!!!!!!!!!!@@@@@@@@@@@@@@@@@@@@@@@@@@",deviceDetails.length)
                // deviceDetails.forEach((id,i)=>{
                //   setTimeout(() => {
                //   let data={}
                //   console.log("id in data",id)
                //   data["body"]=id
                //   // const response=createMockResponse()
                //   const response = () => {
                //     return {
                //         status: (code) => {
                //             return {
                //                 json: (data) => {
                //                     console.log(`Response Status: ${code}`);
                //                     console.log('Response Data:', data);
                //                 },
                //             };
                //         },
                //     };
                //   };
                //   console.log("mock res in sample test---------------------->",JSON.stringify(response))
                //   // axios.post('https://localhost/v1/newapis/controlaction',data)
                //   // .then(response => {     // Handle success
                //   //     console.log('response',response.Data.status);
                //   // })   .catch(error => {     // Handle error
                //   //     console.error('Error:', error);   
                //   // });
                //   de.hdlEquipmentAction(data,response());
                //   // de.hdlEquipmentAction(data, response())
                //   //   .then(({ status, data }) => {
                //   //     console.log("Status:in response", status);
                //   //     console.log("Data:in response", data);
                //   //   })
                //   //   .catch(error => {
                //   //     console.error("Error:", error);
                //   //   });
                //   // console.log(`-----------------------------------------@@@@@@@@@@@@@@result after schdule call ${JSON.stringify(result)}`);              
                //   // de.hdlEquipmentAction(data);
                //   }, 100);
                // })
              // }
              }
              else{
               if(ele.ss_id!=null && ele.ss_id.split(",").length>0){
                let controlParam={
                  "NONGL_SS_AHU":"SAF_VFD_On_Off",
                  "SS_HTE_FAN":"HTE_On_Off",
                  "SS_BRE_FAN":"BRE_Fan_On_Off",
                  "SS_VENTILATOR_1":"VEN_On_Off",
                  "FRESH_AIR_UNIT":"FAU_On_Off",
                  "SS_SUBE_FAN":"SubE_Fan_On_Off",
                  "NONGL_SS_AIR_COOLED_CHILLER":"CH_On_Off",
                  "NONGL_SS_PUMPS":"Pri_Pmp_On_Off",
                  "NONGL_SS_SECONDARY_PUMPS":"Sec_Pmp_On_Off"
                }
                let payload={}
                let device=ele.ss_id.split(",")
                payload["ss_type"]=ele.ss_type
                payload["ss_id"]=ele.ss_id.split(",")
                payload["gl_command"]=ele.command=="TURN_ON"?"TURN_ON":"TURN_OFF"
                payload["zone_type"]=ele.zone_type
                payload["zone_id"]=ele.zone_id
                payload["param_id"]=controlParam[ele.ss_type]//ele.param_name
                payload["value"]=action["gl_command"]==="TURN_ON"?"On":"Off"
                payload["commandFrom"]="SCHEDULE"
                console.log(`formatted payload ${JSON.stringify(payload)}`)
                if(device.length>0){
                  payload["ss_id"].forEach((id,i)=>{
                    // setTimeout(() => {
                    payload["ss_id"]=id
                    console.log("payload of each dev>",payload,i)
                    let data={}
                    data["body"]=payload
                    console.log("BODY",data,i)
                    const response = () => {
                      return {
                          status: (code) => {
                              return {
                                  json: (data) => {
                                      console.log(`Response Status: ${code}`);
                                      console.log('Response Data:', data);
                                  },
                              };
                          },
                      };
                    };
                    de.hdlEquipmentAction(data,response);
                    // }, 100);
                  })
                }
                }
              }
           
            })
        })

      console.log(`Action ${name} executed at ${new Date()}`);
      //do db operation get detail from gl_detail
    });
    if(job){
      console.log("job created>>>>",ctfArg)
    }else{
      console.log("job failed");
    }
  }

const runJob = (jobList)=>{
    console.log("runJob-------->",JSON.stringify(jobList));
    // [{"id":"60dfea04-5774-493f-934e-0417956f7e77","name":"myschedule","description":"At 2:00 on Tuesday.","cron_tab_fields":"0 2 * * 2","start":"2024-08-20 13:57:26","end":"2025-08-20 13:57:26"},{"id":"b22a5c98-701d-4bd5-a988-4dee26356c80","name":"myschedule","description":"At 2:00 on Tuesday.","cron_tab_fields":"5 2 * * 2","start":"2024-08-20 13:57:26","end":"2025-08-20 13:57:26"}]
    jobList.forEach((sch,i )=> {
        scheduleIdCtf[sch.cron_tab_fields]=sch.id
        scheduleJob(sch.command, sch.cron_tab_fields,i);
      });
}
const init=()=>{
  console.log(`=============LOADED IN SCHEDULE=============`);
  // console.log(scheduleIdCtf)
  model.getStoredSchedule((err,res)=>{
    if(err){
      console.log(err)
    }else{
      console.log(res)
      runJob(res)
      loader=true
      // console.log("After complete ",scheduleIdCtf)
    }
  })
  loader=true
}

if(loader==false)init()
// const testScheduleJob = async () => {
//   let scheduleIdCtf = 'af728611-2814-46e4-8bcf-6112fa00d868';
//   console.log("I AM TRIGGERED FROM HERE");

//   try {
//     const jobDetails = await model.getJobDetails(scheduleIdCtf);
//     console.log(`Job to be performed`, jobDetails);

//     for (let ele of jobDetails) {
//       console.log(ele.zone_id.split(",").length);

//       try {
//         const equipment = await model.getEquipmentByLocationId(ele.zone_id);
//         console.log(equipment);

//         // Continue processing equipment if needed...
//       } catch (error) {
//         console.error(`Error fetching equipment for zone ${ele.zone_id}:`, error);
//       }
//     }
//   } catch (error) {
//     console.error("Error fetching job details:", error);
//   }
// };
// let deviceDetails= await locationIdsToDevice(ele.zone_id.split(","),action);

const locationIdsToDevice=(zones,ss_type=null,action)=>{
  console.log(`--------${JSON.stringify(action)}======>${zones.length}`)
  let devicePayload=[]
  return new Promise((resolve, reject) => {
    let zone_count=0
    // zones.forEach(async(zele)=>{
      const processZones = async () => {
      for (const zele of zones) {
      try {
        console.log("zone_id",zele)
        // {
        //   id: '75f45070-d3c1-48e1-a745-c2d2d22dc4f6',
        //   zone_id: 'fa8caf87-f30b-11ed-8ae5-9829a659bca4',
        //   ss_id: '75f45070-d3c1-48e1-a745-c2d2d22dc4f6',
        //   created_at: '2024-07-31 18:34:34',
        //   modified_at: '2024-08-13 12:14:24',
        //   name: '01',
        //   ss_tag: null,
        //   description: null,
        //   ss_type: 'NONGL_SS_AHU',
        //   ss_shape: 'rect',
        //   ss_status: 'GL_SS_STATUS_ACTIVE',
        //   ss_address_type: 'GL_SS_ADDRESS_MAC',
        //   ss_address_value: '0001a00000',
        //   ss_parent: 'ec703a94-9e61-11ee-baaa-1a3ce5ae2e09',
        //   coordinates: null
        // }
        const equipment = await model.getEquipmentByLocationId(zele,ss_type);
        // console.log("printing eqp",equipment);
        let eqpCount=0
        let controlParam={
          "NONGL_SS_AHU":"SAF_VFD_On_Off",
          "SS_HTE_FAN":"HTE_On_Off",
          "SS_BRE_FAN":"BRE_Fan_On_Off",
          "SS_VENTILATOR_1":"VEN_On_Off",
          "FRESH_AIR_UNIT":"FAU_On_Off",
          "SS_SUBE_FAN":"SubE_Fan_On_Off",
          "NONGL_SS_AIR_COOLED_CHILLER":"CH_On_Off",
          "NONGL_SS_PUMPS":"Pri_Pmp_On_Off",
          "NONGL_SS_SECONDARY_PUMPS":"Sec_Pmp_On_Off"
        }
        for(eqp of equipment){
            let payload={}
            payload["ss_type"]=eqp.ss_type
            payload["ss_id"]=eqp.id
            payload["gl_command"]=action["gl_command"]
            // payload["zone_type"]=actionment.zone_type
            //payload["zone_id"]=actionment.zone_id
            payload["param_id"]=controlParam[eqp.ss_type]
            payload["value"]=action["gl_command"]==="TURN_ON"?"TURN_ON":"TURN_OFF"
            payload["commandFrom"]="SCHEDULE"
            devicePayload.push(payload)
            eqpCount++
            console.log(eqpCount,"eqpCount",equipment.length,"number of eqp")
            if(eqpCount===equipment.length){
              // console.log("final",JSON.stringify(devicePayload),"devicess length",devicePayload.length)
              zone_count++
              console.log("zone count",zone_count,"total zone",zones.length)
              if(zone_count==zones.length){
                console.log("TRYING TO RESOLVE",zone_count)
                resolve(devicePayload)
              }
            }
  
          }
        // Continue processing equipment if needed...
      } catch (error) {
        console.error(`Error fetching equipment for zone ${zele}:`, error);
      }
    }
  }
// )
    processZones();
  })
}


const test33zones=async()=>{
  let action={}
  action["gl_command"]="TURN_ON"
  action["param_id"]="AHU_ON_OFF"
  action["value"]="active"
  let zones=["06e2e867-5304-11ef-bb08-2ccf67637fe5","0fbc467f-5304-11ef-bb08-2ccf67637fe5","19546595-5304-11ef-bb08-2ccf67637fe5","2bc550b4-5319-11ef-bb08-2ccf67637fe5","2f3557c2-52f9-11ef-bb08-2ccf67637fe5","3a9c7a6c-5319-11ef-bb08-2ccf67637fe5","3f0522b0-5318-11ef-bb08-2ccf67637fe5","40ed4896-5319-11ef-bb08-2ccf67637fe5","46695694-5319-11ef-bb08-2ccf67637fe5","46dacc84-5318-11ef-bb08-2ccf67637fe5","470c187d-52f9-11ef-bb08-2ccf67637fe5","483cfd73-52f9-11ef-bb08-2ccf67637fe5","4d3f6bdf-5318-11ef-bb08-2ccf67637fe5","540b3596-5318-11ef-bb08-2ccf67637fe5","59fb113c-50dd-11ef-80a5-9829a659c337","5a3c8cfd-5318-11ef-bb08-2ccf67637fe5","60482f3c-5318-11ef-bb08-2ccf67637fe5","649110dc-5303-11ef-bb08-2ccf67637fe5","83424e35-52f8-11ef-bb08-2ccf67637fe5","8a070cb9-5302-11ef-bb08-2ccf67637fe5","990d1a96-5318-11ef-bb08-2ccf67637fe5","9f14301d-5318-11ef-bb08-2ccf67637fe5","a6e406cb-5318-11ef-bb08-2ccf67637fe5","af99e4fd-5302-11ef-bb08-2ccf67637fe5","b6f18a0b-5318-11ef-bb08-2ccf67637fe5","e5305d96-5303-11ef-bb08-2ccf67637fe5","e688a2bb-52f7-11ef-bb08-2ccf67637fe5","eb1735f6-5318-11ef-bb08-2ccf67637fe5","eb32cb5b-7eeb-45c5-9da9-a4a170aa3e20","f21eb549-5318-11ef-bb08-2ccf67637fe5","f7dcabc0-5318-11ef-bb08-2ccf67637fe5","fa8caf87-f30b-11ed-8ae5-9829a659bca4","fed3bc3d-5318-11ef-bb08-2ccf67637fe5"]
  let deviceDetails= await locationIdsToDevice(zones,action);
  deviceDetails.forEach((id,i)=>{
    setTimeout(() => {
    let data={}
    console.log("id in data",id)
    data["body"]=id
    console.log("BODY",data,i)
      de.hdlEquipmentAction(data);
    }, 100);
  })
}

// test33zones()

const testScheduleJob=()=>{
  let devicePayload=[]
  let scheduleIdCtf='af728611-2814-46e4-8bcf-6112fa00d868';
  console.log("I AM TRIGGER FROM HERE")
  model.getJobDetails(scheduleIdCtf,async(err,res)=>{
    console.log(`job to be performed`,res)
    res.forEach(async(ele)=>{
      // zone_id: (data.target && Array.isArray(data.target.zone_id) && data.target.zone_id.length > 0) ? data.target.ss_id.join() : null,
      // console.log(ele.zone_id.split(",").length,ele.zone_id)
      // ele:{
      //   id: 5,
      //   schedule_id: 'af728611-2814-46e4-8bcf-6112fa00d868',
      //   target_id: null,
      //   target_type: null,
      //   zone_id: '59fb113c-50dd-11ef-80a5-9829a659c337,fa8caf87-f30b-11ed-8ae5-9829a659bca4',
      //   zone_type: 'GL_LOCATION_TYPE_ZONE',
      //   ss_id: '',
      //   ss_type: '',
      //   command: 'TURN_ON',
      //   arguments: null,
      //   is_active: null,
      //   created_at: '2024-09-18 18:16:30',
      //   modified_at: '2024-09-19 14:53:39',
      //   param_name: null,
      //   param_value: null
      // }
      if(ele.zone_id.split(",").length>0){
        ele.zone_id.split(",").forEach(async(zele)=>{
          try {
            console.log(zele)
            
            // {
            //   id: '75f45070-d3c1-48e1-a745-c2d2d22dc4f6',
            //   zone_id: 'fa8caf87-f30b-11ed-8ae5-9829a659bca4',
            //   ss_id: '75f45070-d3c1-48e1-a745-c2d2d22dc4f6',
            //   created_at: '2024-07-31 18:34:34',
            //   modified_at: '2024-08-13 12:14:24',
            //   name: '01',
            //   ss_tag: null,
            //   description: null,
            //   ss_type: 'NONGL_SS_AHU',
            //   ss_shape: 'rect',
            //   ss_status: 'GL_SS_STATUS_ACTIVE',
            //   ss_address_type: 'GL_SS_ADDRESS_MAC',
            //   ss_address_value: '0001a00000',
            //   ss_parent: 'ec703a94-9e61-11ee-baaa-1a3ce5ae2e09',
            //   coordinates: null
            // }
            const equipment = await model.getEquipmentByLocationId(zele);
            console.log("printing eqp",equipment);
              let payload={}
              for(eqp of equipment){
                payload["ss_type"]=eqp.ss_type
                payload["ss_id"]=eqp.id
                payload["gl_command"]=ele.command
                // payload["zone_type"]=element.zone_type
                //payload["zone_id"]=element.zone_id
                payload["param_id"]=ele.param_name
                payload["value"]=ele.param_value
                devicePayload.push(payload)
                console.log("final",JSON.stringify(devicePayload))
              }
            // Continue processing equipment if needed...
          } catch (error) {
            console.error(`Error fetching equipment for zone ${ele.zone_id}:`, error);
          }
        })
      }
      // model.getEquipmentByLocationId(ele.zone_id,(err,res)=>{
      //   if(err){
      //     console.log(err)
      //   }else{
      //     console.log(res)
      //   }
      // })
    })

    // res.forEach(element=>{
    //   let payload={}
    //   let device=element.ss_id.split(",")
    //   payload["ss_type"]=element.ss_type
    //   payload["ss_id"]=element.ss_id.split(",")
    //   payload["gl_command"]=element.command
    //   payload["zone_type"]=element.zone_type
    //   payload["zone_id"]=element.zone_id
    //   payload["param_id"]=element.param_name
    //   payload["value"]=element.param_value
    //   console.log(`formatted payload ${JSON.stringify(payload)}`)
    //   if(device.length>0){
    //     payload["ss_id"].forEach(id=>{
    //       payload["ss_id"]=id
    //       console.log("payload of each dev>",payload)
    //     })
    //     console.log("LOOP THE PAYLOAD FRO EACH SS_ID")
    //   }
    // })
})
}

[
{"id":6,
  "schedule_id":"9d9611c4-9485-470d-adba-f6f1ea916d03",
  "target_id":null,"target_type":null,
  "zone_id":null,"zone_type":null,
  "ss_id":"6cf3c4ff-72ef-4ecc-81af-84b6a944a82a","ss_type":"NONGL_SS_AHU",
  "command":"TURN_OFF",
  "arguments":null,
  "is_active":null,
  "created_at":"2024-09-18 18:16:30","modified_at":"2024-09-18 18:16:30",
  "param_name":null,"param_value":null
}
]



// testScheduleJob()

module.exports={runJob}
/*
start,end
if start exist dont create record (get id) 
if end exist dont create record (get id) 
D:\projects\IBMS_25_03\baseline\sirius-2.0>
D:\projects\IBMS_25_03\baseline\Delivered>
D:\projects\IBMS_25_03\baseline\Simulator_PBS_1_2_CSVLoader>
create sch_det with(get id)

i worked on scheduling multiple zones (33) it has devices(136) and controlled 120 devices some commad are not reached and finding what is worng and tried to fix
and started working on writing set point to header and it should effect all chiller under that header
*/
