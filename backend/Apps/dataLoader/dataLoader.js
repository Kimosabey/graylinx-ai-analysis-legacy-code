const schedule = require('node-schedule');
const controller = require('./controller');
const bacnet = require('../../hvacBACnetClient');
const { toFixed,printDate } = require('../../Utils/common');
const async = require('async');
const hvacBACnetClient=require('../../hvacBACnetClient');
const axiosc = require('axios');
const http = require('http');
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });
const keepAliveAgent = new http.Agent({ keepAlive: true });
const { OK, CREATED, ACCEPTED } = require('http-status');
const logger = require('../../Config/logger');


let final_instance_ip=[]
let instance_ip={}

const readDAta=()=>{
    // let data= {
    //     '192.168.1.201': [
    //       { instance: '7', flag: false, type: '2' },
    //       { instance: '10', flag: false, type: '2' },
    //       { instance: '11', flag: false, type: '2' },
    //       { instance: '19', flag: false, type: '2' },
    //       { instance: '13', flag: false, type: '2' },
    //       { instance: '1', flag: false, type: '2' },
    //       { instance: '9', flag: false, type: '2' },
    //       { instance: '6', flag: false, type: '2' },
    //       { instance: '14', flag: false, type: '2' },
    //       { instance: '8', flag: false, type: '2' },
    //       { instance: '15', flag: false, type: '2' },
    //       { instance: '21', flag: false, type: '2' },
    //       { instance: '17', flag: false, type: '2' },
    //       { instance: '5', flag: false, type: '2' },
    //       { instance: '3', flag: false, type: '2' },
    //       { instance: '4', flag: false, type: '2' },
    //       { instance: '2', flag: false, type: '2' },
    //       { instance: '12', flag: false, type: '2' },
    //       { instance: '16', flag: false, type: '2' },
    //       { instance: '18', flag: false, type: '2' }
    //     ]
    //   }
    // {"reqArr":[{"objectId":{"type":"2","instance":"2"},"properties":[{"id":77},{"id":85}]},{"objectId":{"type":"2","instance":"3"},"properties":[{"id":77},{"id":85}]},{"objectId":{"type":"2","instance":"100"},"properties":[{"id":77},{"id":85}]},{"objectId":{"type":"2","instance":"6"},"properties":[{"id":77},{"id":85}]},{"objectId":{"type":"2","instance":"1"},"properties":[{"id":77},{"id":85}]},{"objectId":{"type":"5","instance":"3"},"properties":[{"id":77},{"id":85}]},{"objectId":{"type":"2","instance":"4"},"properties":[{"id":77},{"id":85}]},{"objectId":{"type":"5","instance":"2"},"properties":[{"id":77},{"id":85}]}],"ip":"192.168.1.201"}

    //  let data={"192.168.0.107":[{"instance":"13015","flag":false,"type":"2","devId":"0101","id":"d8c98d2c-d160-433c-a4a9-6982bfc0bcc2","name":"VFD Bypass Status","devType":"NONGL_SS_AHU"},{"instance":"23020","flag":false,"type":"2","devId":"0101","id":"12ab864c-a8bc-4e5d-8824-13817d695021","name":"em_reactivePowerPhase2","devType":"NONGL_SS_EMS"}]}

    // http://localhost:7080/readmultiple/192.168.1.4/2:12065/objectName/description/presentValue/2:23132/objectName/description/20:26132/objectName/description/2:12065/objectName/description/presentValue/2:12132/objectName/description/20:16132/objectName/description
    let count=0
    let finArr=[]
    if(Object.keys(instance_ip).length>0){
        for(var key in instance_ip){
            console.log(key)
            let reqArr=[]
            let dataLoop=0
            let requestAdress='http://localhost:7080/readmultiple/'+key
            instance_ip[key].forEach(element=>{
                dataLoop++
                requestAdress += `/${element.type}:${element.instance}/objectName/presentValue`
                if(dataLoop==instance_ip[key].length){
                    //console.log("reqAdreee",requestAdress)
                    axios
                    .get(requestAdress)
                    .then((res)=>{
                        console.log(res.data)
                        logger.info("------------every 15 minscalled------ "+printDate())
                        //res.status(OK)
                       // callback(null,'ACCEPTED')
                    })
                    .catch((err)=>{
                      console.log(err)
                    })
                }

            })
          
        }
    }
    //node bacnet stack to readmuiltiple
    // if(Object.keys(instance_ip).length>0){
    //     for(var key in instance_ip){
    //         console.log(key)
    //         let reqArr=[]
    //         let dataLoop=0
    //         instance_ip[key].forEach(element=>{
    //             dataLoop++
    //             if(!element.flag){
    //                 reqArr.push({ objectId: { type: element.type, instance: element.instance}, properties: [{ id: 77 }, { id: 85 }] })
    //             }
    //             if(dataLoop==instance_ip[key].length){
    //                 hvacBACnetClient.myReadPropertyMultiple1(key,reqArr,(err,results)=>{
    //                    if(err){
    //                        console.log("error in dataloader readdata",err)
    //                    }else{
    //                        finArr.push.apply(finArr, results)
    //                        count++  
    //                       // console.log("-------------->finaarr",finArr,Object.keys(instance_ip).length,dataLoop)
    //                        if(count==Object.keys(instance_ip).length){
    //                            //insert into per and update latestevent
    //                            controller.insertUpdatePLE(finArr,instance_ip,(err,resultAdd)=>{
    //                                if(err){
    //                                 console.log(err)
    //                                    //callback(err)
    //                                }else{
    //                                    console.log("successfully updataed every 15 mins")
    //                                }
    //                            })
    //                    }
    //                }
    //            })
    //             }

    //         })
          
    //     }
    // }
  
  
}

function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  


const prepareAddress=(arr)=>{
    let dataLoop=0
    // console.log("arrrr---->",arr[0].length,JSON.stringify(arr))
    let chu=chunkArray(arr[0],10)
    console.log("iam chu",chu.length)
    let chuc=0
    chu.forEach(e=>{
        let requestAdress='http://localhost:7080/readmultiple/'+arr[0][0].ip
        let ecount=0
        e.forEach(element=>{
            ecount++
            requestAdress += `/${element.type}:${element.instance}/objectName/presentValue`  
            if(ecount==e.length){
                chuc++
                console.log("reqAdreee",chuc, requestAdress)
                axios
                .get(requestAdress,{ params: { type:'_p' } })
                .then((res)=>{
                    console.log(console.log("request sent"))
                    //res.status(OK)
                // callback(null,'ACCEPTED')
                })
                .catch((err)=>{
                console.log("errroror",err)
                })
            }
        })
       
    })
   
    // arr[0].forEach(element=>{
    //     dataLoop++
    //     requestAdress += `/${element.type}:${element.instance}/objectName/presentValue`
    //     if(dataLoop==arr[0].length){
    //         console.log("reqAdreee",requestAdress)
    //         axios
    //         .get(requestAdress)
    //         .then((res)=>{
    //             console.log(res.data)
    //             //res.status(OK)
    //            // callback(null,'ACCEPTED')
    //         })
    //         .catch((err)=>{
    //           //console.log(err)
    //         })
    //     }

    // })
}

const readDataInter=()=>{
    let iterate=final_instance_ip.length
    let count=0
    if(final_instance_ip.length > 0){
    const intervalId = setInterval(() => {
        console.log('counter',count)
        prepareAddress(Object.values(final_instance_ip[count]))
        count++;
        if (count === iterate) {
          console.log('Clearing the interval id after count executions');
          logger.info("all devices completed storing"+printDate())
          clearInterval(intervalId);
        }
      }, 3000);
    }else{
        console.log("NO DATA AVAILABLE")
    }
}
//uncomment will running with device
let loadmydata = false
if(loadmydata){
    setInterval(() => {
        console.log("-----------------********--------->read data",printDate());
        logger.info("came to read"+printDate())
       // readDAta()  
       readDataInter()
    },1000*60*15);
}


const setInstanceIp=()=>{
    controller.instancesInfo((err,allDevInstanceList)=>{
        if(err){
            console.log("eroor",err)
        }else{
           let ip_list=allDevInstanceList.map(data=>data.id)
            let ips=  new Set(ip_list);
            const ips_list = [...ips];
            let countips=0
            ips_list.forEach(data=>{
                let instance_ip={}
                let insArr=[]
                let allCount=0
                allDevInstanceList.forEach(element => {
                    let object={}
                    if(data==element.id){
                       object["instance"]=element.instance
                       object["flag"]=false
                       object["type"]=element.type
                       object["devId"]=element.tag
                       object["ip"]=element.ip
                       object["name"]=element.parameter
                       object["devType"]=element.ss_type
                       insArr.push(object)
                       allCount++
                       if(allCount==allDevInstanceList.length){  
                        countips++  
                        instance_ip[data]=insArr
                        final_instance_ip.push(instance_ip)
                        if(countips==ips_list.length){
                            console.log("-------------------------->instancelist")
                           // readDAta()
                        }
                       }

                    }else{
                        allCount++
                        if(allCount==allDevInstanceList.length){
                            countips++  
                            //console.log("=======json.strinfy",JSON.stringify(insArr))  
                            instance_ip[data]=insArr
                            final_instance_ip.push(instance_ip)
                            if(countips==ips_list.length){
                                console.log("-------------------------->instancelist")
                               // readDAta()
                            }
                           }
                    }
                    
                });
            })
            
           // console.log("alll devicelist",allDevInstanceList.length)
        }

    })

}


const setFlag=(ip,instance,callback)=>{
    instance_ip[ip].forEach(data=>{
        if(data.instance==instance){
            data.flag=true
            callback(null,'updated_instance_vector')
        }
    })

}

const pullForLatest=(deviceId)=>{
    controller.getDeviceChildren(deviceId,(error,result)=>{
                if(error){
                    callback(error)
                }else{
                    //readmultiple
                   // console.log("------------------dataloader",JSON.stringify(result))
                    let dataLoop=0
                 //   let requestAdress='http://localhost:7080/readmultiple/'+result.ip
                    let chu=chunkArray(result.resultData,10)
                    let chuc=0
                    chu.forEach(e => {
                        let requestAdress = 'http://localhost:7080/readmultiple/'+result.ip
                        let ecount = 0
                        e.forEach(element => {
                            ecount++
                            requestAdress += `/${element.ss_tag}:${element.ss_address_value}/objectName/presentValue`
                            if (ecount == e.length) {
                                chuc++
                                console.log("reqAdreee 5 sec", chuc, requestAdress)
                                axios
                                    .get(requestAdress,{ params: { type:'LE' } })
                                    .then((res) => {
                                        console.log("request sent")
                                        //res.status(OK)
                                        // callback(null,'ACCEPTED')
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                    })
                            }
                        })

                    })
                    // result.resultData.forEach(element=>{
                       
                    //     dataLoop++
                    //     requestAdress += `/${element.ss_tag}:${element.ss_address_value}/objectName/presentValue`
                    //     if(dataLoop== result.resultData.length){
                    //         // console.log("------>request adresss",requestAdress)
                    //         axios
                    //         .get(requestAdress)
                    //         .then((res)=>{
                    //             console.log(res.data)
                    //             //res.status(OK)
                    //            // callback(null,'ACCEPTED')
                    //         })
                    //         .catch((err)=>{
                    //           console.log(err)
                    //         })
                    //     }
                    // })

                //     hvacBACnetClient.myReadPropertyMultiple1(result.ip,result.reqArr,(err,results)=>{
                //         if(err){
                //             console.log("error in dataloader readdata",err)
                //         }else{     
                //            // console.log("-------------->finaarr",finArr,Object.keys(instance_ip).length,dataLoop)
                //            controller.updateLatestEvent(deviceId,result.resultData,results,(errup,resultup)=>{
                //             if(errup){
                //                console.log("error in latest evry 5 sec pull",errup)
                //             }else{
                //                console.log("latested event updated evry pull from ui")
                //             }
                //            })

                //            //callback(null,result)   
                //     }
                // })
                   
                }
    })

}

//pullForLatest('1ddbf310-c15e-4774-a155-3726503f7d59')

// pullForLatest('adbcde65-f847-4ca2-85a1-6c197cc6b163',(err,res)=>{
//     console.log("done for day")
// })

//uncomment will running with device
setInstanceIp()
module.exports={
    setFlag,
    pullForLatest
}



