const models = require('./model');
const _ = require('lodash');

const removeDuplicates = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
};



const getSetPoint =  callback => {
  models.getSetPoint( (err, results) => {
    if (err) {
      callback(err);
    } else {
     let data=removeDuplicates(results,'process_id')
      let finalData=[]
      let index=0
      data.forEach(element => {
        let payload={}
        payload.process_id=element.process_id
        payload.param_value=element.param_value
        payload.ss_id=element.ss_id
        payload.ss_parent=element.ss_parent
        let i=0
          results.forEach(resData=>{
            if(element.process_id===resData.process_id){
                payload[resData.paramname]=resData.detail_param_value
                i++
                if(i==results.length){
                  finalData.push(payload)
                  index++
                  if(index===data.length){
                    callback(null,finalData)
                  }
                }
            }else{
              i++
              if(i==results.length){
                index++
                if(index===data.length){
                  callback(null,finalData)
                }
              }
            }
          })
      });
      // callback(null, results);
    }
  });
};


const getInOutairtemperature = (zoneId, callback) => {
  models.getInOutairtemperature(zoneId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};


const getSupplyAirTemp = (zoneId, callback) => {
  models.getSupplyAirTemp(zoneId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};


const getValvePosition=(id,callback)=>{
  models.getValvePosition(id,(error,result)=>{
    if(error){
      callback(error)
    }else{
      callback(null,result)
    }
  })
}

const insertARC=(oav,rav,chw,callback)=>{
   models.insertArc(oav,rav,chw,(error,result)=>{
     if(error){
       callback(error)
     }else{
       callback(null,result)
     }
   })

}


const updateChwv=(chwv,process_id,callback)=>{
  models.updateChwv(chwv,process_id,(error,result)=>{
        if(error){
          callback(error)
        }else{
          callback(null,result)
        }
  })
}


const updateSpm=(process_id,callback)=>{
  models.updateSpm(process_id,(error,result)=>{
    if(error){
      callback(error)
    }else{
      callback(null,result)
    }
  })
}


const getbactnetDAta=(ss_id,callback)=>{
  models.getbactnetDAta(ss_id,(err,result)=>{
    if(err){
      callback(err)
    }else{
      callback(null,result)
    }
  })
}

const insertChwv=(ss_id,presentvalue,callback)=>{
  models.insertChwv(ss_id,presentvalue,(err,result)=>{
    if(err){
      callback(err)
    }else{
      callback(null,result)
    }
  })
}
module.exports = {
    getSetPoint,
    getInOutairtemperature,
    getSupplyAirTemp,
    getValvePosition,
    updateChwv,
    updateSpm,
    getbactnetDAta,
    insertChwv
  };
