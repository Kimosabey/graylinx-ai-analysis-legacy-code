const models = require('./model');
const { toFixed,printDate } = require('../../Utils/common');

const instancesInfo=(callback)=>{
    models.instancesInfo((err,allDevInstanceList)=>{
        if(err){
            callback(err)
        }else{
            callback(null,allDevInstanceList)
        }
    })
}


const getDeviceChildren=(devId,callback)=>{
    models.getDeviceChildren(devId,(error,result)=>{
        if(error){
            console.log("errorrr----->",error)
            callback(error)
        }else{
            let reqArr=[]
            let count=0
            if(result.length>0){
                result.forEach(element => {
                    reqArr.push({ objectId: { type: element.ss_tag, instance: element.ss_address_value }, properties: [{ id: 77 }, { id: 85 }] })
                    count++
                    if(count==result.length){
                       let res={'reqArr':reqArr,'ip':element.ip,'resultData':result}
                        callback(null,res)
                    }
                   });
            }else{
                callback(null,reqArr)
            }
           
          //  callback(null,result)
        }
    })
}

const insertUpdatePLE=(data,resp,callback)=>{
    //console.log("--------------------------------------------------------------->PLE",data)
    let resArr=[]
    let respCount=0
        for(var res in resp){
            let rescount=0
           resp[res].forEach((eachObj)=>{
                let dataCount=0
                resObj={}
                data.forEach(element=>{
                    if(parseInt(eachObj.instance)===element.objectId){
                        dataCount++
                        resObj['ins']=eachObj.instance
                        resObj['id']=eachObj.id
                        resObj['param']=eachObj.name
                        resObj['p_value']=element.presentValue
                        resObj['time']=element.time
                        resObj['devType']=eachObj.devType
                        resObj['tableName']=eachObj.devType=='NONGL_SS_EMS'?'em_'+eachObj.devId+'_om_t':'ahu_'+eachObj.devId+'_om_p'
                        resArr.push(resObj)
                        if(data.length==dataCount){
                            rescount++
                            if(resp[res].length==rescount){
                                respCount++
                                if(respCount==Object.keys(resp).length){
                                    console.log("-------------------->resarr",resArr.length)
                                    //insert into respermanent
                                    insertEmData(resArr)
                                    //insert into per and latest event
                                    models.insertUpdatePLE(resArr,(errIns,resultIns)=>{
                                        if(errIns){
                                            callback(errIns)
                                        }else{
                                            callback(null,resultIns)
                                        }
                                    })
                                    
                                }
                            }    
                        }
                    }else{
                        dataCount++
                        if(data.length==dataCount){
                            rescount++
                            if(resp[res].length==rescount){
                                respCount++
                                if(respCount==Object.keys(resp).length){
                                     //insert into respermanent
                                     insertEmData(resArr)
                                   console.log("-----------else--------->resarr",resArr.length)
                                   models.insertUpdatePLE(resArr,(errIns,resultIns)=>{
                                    if(errIns){
                                        callback(errIns)
                                    }else{
                                        callback(null,resultIns)
                                    }
                                })
                                }
                            }    
                        }
                    }
                })
            })
        }
}


const removeDuplicates = (myArr, prop) => {
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  };
const insertEmData=(resArr)=>{
        let ems=resArr.filter(element=>(element.devType=="NONGL_SS_EMS"))
        let ss_ids=ems.map(element=>({"id":element.id,"tb":element.tableName}))
       // console.log("-----ss_ids",ss_ids)
        let ssid=removeDuplicates(ss_ids,'id')
        let final=[]
        let ssidcount=0
        ssid.forEach(element=>{
            let pay={}
            let keyvalue={}
            let emsc=0
            ems.forEach(each=>{
                    if(each.id==element.id){
                        emsc++
                        keyvalue[each.param]=each.p_value
                        //keyvalue["measured_time"]=each.time
                        keyvalue["ss_id"]=element.id
                        if(emsc==ems.length){
                            pay[element.tb]=keyvalue
                            final.push(pay)
                            ssidcount++
                            if(ssid.length==ssidcount){
                                //make db call
                                //console.log("---->to db call",JSON.stringify(final))
                                models.insertempermanent(final,(error,result)=>{
                                    if(error){
                                        console.log("errro while insert in permanent data",error)
                                    }else{
                                        console.log("successfully inserted in em permnament")
                                    }
                                })
                            }
                        }
                    }else{
                        emsc++
                        if(emsc==ems.length){
                            pay[element.tb]=keyvalue
                            final.push(pay)
                            ssidcount++
                            if(ssid.length==ssidcount){
                                //make db call
                                //console.log("---->to db call",JSON.stringify(final))
                                models.insertempermanent(final,(error,result)=>{
                                    if(error){
                                        console.log("errro while insert in permanent data",error)
                                    }else{
                                        console.log("successfully inserted in em permnament")
                                    }
                                })
                            }
                        }
                    }
            })
        })
       
        //console.log("ssid",ssid)
}



const updateLatestEvent=(deviceId,response,bacnetRes,callback)=>{
    let resArr=[]
    let resCount=0
   // console.log("----dataloader controller----json strinfy",JSON.stringify(response))
    response.forEach(element=>{
        const res={}
        let bacCount=0
        bacnetRes.forEach(bac=>{
            if(element.ss_address_value==bac.objectId){
                bacCount++
                res['ss_id']=deviceId
                res['measured_time']=bac.time
                res['param']=element.name
                res['p_value']= toFixed(bac.presentValue,2)
                resArr.push(res)
                if(bacCount==bacnetRes.length){
                    resCount++
                    if(resCount==response.length){
                       // console.log("--------json strinfy",JSON.stringify(resArr))
                        models.updateLatestEvent(resArr,(err,result)=>{
                            if(err){
                                callback(err)
                            }else{
                                callback(null,result)
                            }
                        })
                    }
                }
            }else{
                bacCount++
                if(bacCount==bacnetRes.length){
                    resCount++
                    if(resCount==response.length){
                        // console.log("----else----json strinfy",JSON.stringify(resArr))
                        models.updateLatestEvent(resArr,(err,result)=>{
                            if(err){
                                callback(err)
                            }else{
                                callback(null,result)
                            }
                        })
                    }
                }
            }
        })
    })
}

module.exports={
    instancesInfo,
    getDeviceChildren,
    insertUpdatePLE,
    updateLatestEvent,
    insertEmData
}






