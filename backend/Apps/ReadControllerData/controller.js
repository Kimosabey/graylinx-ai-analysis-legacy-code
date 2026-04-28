const model = require('./model')
const { compareAsc, format } = require('date-fns');

const getDagDevice = (ss_type,callback)=>{
    model.getDagDevice(ss_type,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const getDevice = (id,callback)=>{
    model.getDevice(id,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const getInstancesList = (id,callback)=>{
    model.getInstancesList(id,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const addData = (data,resp,callback)=>{
    // console.log("data",data)
    // console.log("resp",resp)
    let arr1=[]
    let dataUpdateInsert=[]
    data.forEach(ele => {
        resp.forEach(res=>{
            let arr2=[]
            let dataUpIns={}
            if(ele.objectId==res.instance){
                //ss_id,measured_time,param_id,param_value
                dataUpIns['ss_id']=res.id
                dataUpIns['param_id']="em_"+res.parameter
                dataUpIns['param_value']=ele.presentValue
                dataUpdateInsert.push(dataUpIns)
                arr2.push(res.id)
                arr2.push(format(new Date(ele.time), 'yyyy-MM-dd HH:mm:ss'))
                arr2.push("em_"+res.parameter)
                arr2.push(ele.presentValue)
                arr1.push(arr2)
            }
        })
    });

    let payload={}
    let id=resp.map(data=>data.id)
    let id_lst_set=new Set(id);
    const id_list = [...id_lst_set];
    console.log("json_stringfy",JSON.stringify(dataUpdateInsert))
    id_list.forEach(id=>{
        let devicelist=[]
        devicelist=arr1.filter(data=>data[0]==id)
        payload[id]=devicelist
    })
    // console.log("payload",payload)

    model.deviceToSstag((err,results)=>{
        if(err){
            callback(err)
        }else{
            let storeArray =[]
            results.forEach(is=>{
                let storeJson={}
                for(var key in payload){
                    if(is.id==key){
                        console.log("sstagggs",is.ss_address_value)
                        // storeJson["tablename"]
                        switch(is.ss_type){
                            case "NONGL_SS_EMS":storeJson['tablename']="em_"+is.ss_address_value+"_om_t"
                                                storeJson['data']=payload[key]
                                                storeArray.push(storeJson)
                                                break;
                            case "NONGL_SS_AHU":storeJson['tablename']="em_"+is.ss_address_value+"_om_t"
                                                storeJson['data']=payload[key]
                                                storeArray.push(storeJson)      
                                                break;

                            default:
                                    break;                                                    
                      
                                }
                      
                        
                    }
                }
            })
            setTimeout(() => {
                //console.log("storeeee array",storeArray) 
                model.InsertData(storeArray,(errorArr,resArr)=>{
                    if(errorArr){
                        callback(errorArr)
                    }else{
                        model.updateLatestEventSOMReadData(dataUpdateInsert,(errorUp,resultUp)=>{
                            if(errorUp){
                                callback(errorUp)
                            }else{
                                //callback(null,resultUp)
                                callback(null,resArr)
                            }
                        })
                        
                    }
                })
            }, 500);
           
        }
    })
}

const instancesInfo= (callback)=>{
    model.instancesInfo((err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

module.exports ={
    getDagDevice,
    getDevice,
    getInstancesList,
    addData,
    instancesInfo
}