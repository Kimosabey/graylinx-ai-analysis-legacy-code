const { CREATED, OK, ACCEPTED } = require('http-status');
const { validationResult } = require('express-validator');
const logger = require('../../Config/logger');

const service = require('./Gl_analytics.service');
const { floor, result } = require('lodash');
const { callbackPromise } = require('nodemailer/lib/shared');
const { childGlZones } = require('../GlZone/glZone.model');



const getSubsystemId = (req, res, next) => {
  const id=req.params.id
  service.getchild(id, (error, result) => {
    if (error) {
      res.locals.error = error;
      next();
    } else {
      res.status(OK).json(result);
    }
  });
};

const getxmapdatazoneid = (req, res, next) => {
  const id = req.params.id
  const param = req.params.param
  service.getchildxmap(id, param, (error, result) => {
    if (error) {
      res.locals.error = error;
      next();
    } else {
      // deviceData.filter(e => e.type === 'dali_master').map(e => e.mac);
      console.log(result)
      res.status(OK).json(result);
    }
  });
};

const getlast24hr = (req, res, next) => {
  const id = req.params.id
  const param = req.params.param
  service.getlast24hr(id, param, (error, result) => {
    if (error) {
      res.locals.error = error;
      next();
    } else {
      res.status(OK).json(result);
    }
  });
};

const gethvacmapdatazoneid = (req, res, next) => {
  const id = req.params.id
  const param = req.params.param
  service.gethvacmapdatazoneid(id, param, (error, result) => {
    if (error) {
      res.locals.error = error;
      next();
    } else {
      res.status(OK).json(result);
    }
  });
};

const getdevicedatazoneid = (req, res, next) => {
  const id = req.params.id
  const device = req.params.device
  service.getdevicedatazoneid(id, device, (error, results) => {
    if (error) {
      next()
    } else {
      res.status(OK).json(results);
    }
  })
}

const getAhuActualExpected = (req, res, next) => {
  const zoneId = req.params.zoneId
  service.getAhuActualExpected(zoneId, (error, results) => {
    if (error) {
      next(error)
    } else {
      res.status(OK).json(results);
    }

  })

}

const getAhuData = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.getAhuData(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}


const getAhuActualExpected1 = (req, res, next) => {
  const zoneId = req.params.zoneId
  service.getAhuActualExpected1(zoneId, (error, results) => {
    if (error) {
      next(error)
    } else {
      console.log("results--------", results)
      //res.status(OK).json(results);
      let final_data = []
      let dc = 0
      console.log("res---->test",results)
      if(results.length>0){
        results.map(ele => {
          let pay = {}
          pay["ssid"] = ele.ssid,
            pay["name"] = ele.name,
            pay["type"] = ele.type,
            pay["coordinates"] = ele.coordinates
          let count = 0
         // console.log("----------------------------->data",ele.deviceData.current)
          ele.deviceData.current.map(e => {
            // console.log("-------------", e)  
            switch (e.param_id) {
              case 'CHW_Vlv_Pos': console.log("i ai inside swtich")
              let chwData=ele.deviceData.current_sp.filter(sat=>sat.param_id==='CHW_Vlv_Pos_SP')
              if(chwData.length>0){
                ele.deviceData.current_sp.map(e2 => {
                 // console.log("--------> e2 test",e2)
                  if (e2.param_id === 'CHW_Vlv_Pos_SP') {
                    let obj = {}
                    obj["actual"] = e.param_value,
                      obj["expected"] = e2.param_value,
                      obj["name"] = ele.name,
                      obj["ssid"] = ele.ssid
                    pay["ChW Valve"] = obj
                    count++
                   // console.log("test_chw=>count",count, ele.deviceData.current.length)
                   // console.log("pramaaa--------------------", pay)
                  }
                })
              }else{
                let obj = {}
                obj["actual"] = e.param_value,
                  obj["expected"] =0,
                  obj["name"] = ele.name,
                  obj["ssid"] = ele.ssid
                pay["ChW Valve"] = obj
                count++
              }
                break
              case 'SAT': console.log("i ai inside swtich")
              let satData=ele.deviceData.current_sp.filter(sat=>sat.param_id==='SAT_SP')
              if(satData.length>0){
                ele.deviceData.current_sp.map(e2 => {
                  //console.log("======e2sat>test",e2)
                  if (e2.param_id === 'SAT_SP') {
                    let obj = {}
                    obj["actual"] = e.param_value,
                      obj["expected"] = e2.param_value,
                      obj["name"] = ele.name,
                      obj["ssid"] = ele.ssid
                    pay["SAT"] = obj
                    count++
                   // console.log("test_sat=>count",count, ele.deviceData.current.length)
                   // console.log("pramaaa--------------------", pay)
                  }
                })
              }else{
                let obj = {}
                obj["actual"] = e.param_value,
                  obj["expected"] = 0,
                  obj["name"] = ele.name,
                  obj["ssid"] = ele.ssid
                pay["SAT"] = obj
                count++
               // console.log("test_sat=>count",count, ele.deviceData.current.length)
              }
               
                break
              case 'RAT': console.log("i ai inside swtich")
              let ratData=ele.deviceData.current_sp.filter(sat=>sat.param_id==='RAT_SP')
              if(ratData.length>0){
                ele.deviceData.current_sp.map(e2 => {
                  if (e2.param_id === 'RAT_SP') {
                    let obj = {}
                    obj["actual"] = e.param_value,
                      obj["expected"] = e2.param_value,
                      obj["name"] = ele.name,
                      obj["ssid"] = ele.ssid
                    pay["RAT"] = obj
                    count++
                   // console.log("test_rat=>count",count, ele.deviceData.current.length)
                  //  console.log("pramaaa--------------------", pay)
                  }
                })
              }else{
                let obj = {}
                obj["actual"] = e.param_value,
                  obj["expected"] = 0,
                  obj["name"] = ele.name,
                  obj["ssid"] = ele.ssid
                pay["RAT"] = obj
                count++
              }
               
                break
  
              default: count++
             // console.log("test_ defautt=>count",count, ele.deviceData.current.length)
            }
          
            if (count == ele.deviceData.current.length) {
            //  console.log("payyyy", pay)
              final_data.push(pay)
              dc++
              if (dc == results.length) {
              //  console.log("final data", final_data)
                res.status(OK).json(final_data);
              }
            }
          })
  
  
        })
      }else{
        res.status(OK).json(final_data);
      }
    }

  })

}


const getAhuDataLast1Hr = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.getAhuDataLast1Hr(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const getVavDataLast1Hr = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.getVavDataLast1Hr(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const getEmsData = (req, res, next) => {
  const floorId = req.params.floorId
  service.getEmsData(floorId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const getEmsDeviceData = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.getEmsDeviceData(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const getEnergyDataLast1Hr = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.getEnergyDataLast1Hr(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const ems24hoursdata = (req, res, next) => {
  const deviceId = req.params.deviceId
  const day = req.params.day
  // console.log("params-----",req.params)
  service.ems24hoursdata(deviceId,day, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const ems7daysdata= (req, res, next) => {
  const deviceId = req.params.deviceId
  const day = req.params.day
  // console.log("params-----",req.params)
  service.ems7daysdata(deviceId,day, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const getUpsDeviceData = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.getUpsDeviceData(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const getUpsDataLast1Hr = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.getUpsDataLast1Hr(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}
const getcsuDataLast1Hr = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.getcsuDataLast1Hr(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const getDeviceTimeSeriesData=(req,res)=>{
  const zoneId = req.params.zoneId
  const deviceType = req.params.deviceType
  service.getDeviceTimeSeriesData(zoneId,deviceType, (error, results) => {
    if (error) {
      // next()
      res.locals.error = error;
    } else {
      res.status(OK).json(results);
    }
  })
}

const getChillerDataLast1Hr = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.getChillerDataLast1Hr(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const getCoolingTowerDataLast1Hr = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.getCoolingTowerDataLast1Hr(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(OK).json(results);
    }
  })
}

const commonGraphApiForAll = (req, res, next) => {
  const deviceId = req.params.deviceId
  service.commonGraphApiForAll(deviceId, (err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(ACCEPTED).json(results);
    }
  })
}

const metricGraphApiForAll = (req, res, next) => {
  const ss_type = req.params.ss_type
  const metric_id = req.params.metric_id
  const normal = req.params.default
  service.metricGraphApiForAll(ss_type,metric_id,normal,(err, results) => {
    if (err) {
      next(err)
    } else {
      res.status(ACCEPTED).json(results);
    }
  })
}

const getdevicedatabyzoneid = (req, res, next) => {
  const id = req.params.id
  const device = req.params.device
  console.log(id);
  console.log(device);
  service.getdevicedatabyzoneid(id, device, (error, results) => {
    if (error) {
      next()
    } else {
      res.status(OK).json(results);
    }
  })
}


const getDeviceDataLast1Hr=(req,res,next)=>{
  const id=req.params.deviceId
  const deviceType=req.params.type
  const interval = req.params.interval
  const startdate = req.body.startdate
  const enddate = req.body.enddate
  console.log("deviceId: ",id,"deviceType: ",deviceType, "interval: ",interval)
  service.getDeviceDataLast1Hr(id,deviceType,interval,startdate,enddate,(error,results)=>{
    if(error){
      next()
    }else{
      res.status(OK).json(results)
    }
  })
}

const getEquipmentList=(req,res,next)=>{
  service.getEquipmentList((error,results)=>{
    if(error){
      next()
    }else{
      res.status(OK).json(results)
    }
  })
}

const getParameterTypes=(req,res,next)=>{
  const id =req.params.deviceId
  const type=req.params.type
  service.getParameterTypes(id,type,(error,results)=>{
    if(error){
      next()
    }else{
      res.status(OK).json(results)
    }
  })
}

// const getEquipmentIdCurrentParameters=(req,res,next)=>{
//   const id=req.params.deviceId
//   service.getEquipmentIdCurrentParameters(id,(error,results)=>{
//     if(error){
//       next()
//     }else{
//       res.status(OK).json(results)
//     }
//   })
// }

const getTemperature=(req,res,next)=>{
  const id=req.params.floorID
  const type=req.params.eqType
  service.getTemperature(id,type,(error,results)=>{
    if(error){
      next()
    }else{
      res.status(OK).json(results)
    }
  })
}

const deviceParametersReports=(req,res,next)=>{
  const id = req.params.id
  const interval = req.body.interval
  const parameters = req.body.parameters
  service.deviceParametersReports(id,interval,parameters,(error,results)=>{
    if(error){
      next()
    }else{
      res.status(OK).json(results)
    }
  })
}

// async function dailyenergyconsumptionforallem (req,res, next)
// {
//   try{
//     const emList = await service.getAllEnergyMeters();
//     res.send(emList);
//  console.log("from controller", emList);
//   }
//   catch(error){
//     console.log(error);
//   }
 
// }


async function energyConsumptionChart(req, res, next) {
  try {
    const deviceType = req.query.device_type || "ALL";
    const timeRange = req.query.time_range;
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    const result = await service.energyConsumptionChart(deviceType, timeRange, start_date, end_date);
    
    res.send({
      success: true,
      device_type: deviceType,
      time_range: timeRange,
      data: result
    });

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
}
async function getAssetHealthEnergy (req, res) {
  try {
    const deviceType = req.query.device_type || 'ALL';
    const timeRange = req.query.time_range || 'daily';
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    const data = await service.getAssetHealthEnergy(
      deviceType,
      timeRange,
      start_date,
      end_date
    );

    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error fetching asset health energy' });
  }
}


 async function getEnergyHeatmap(req, res) {
  try {
    const deviceType = req.query.device_type || 'ALL';
    const timeRange = req.query.time_range || 'daily';
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    const data = await service.getEnergyHeatmap(deviceType, timeRange, start_date, end_date);
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Heatmap API failed' });
  }
}


// async function assetHealthAlarmCount(req, res) {
//   try {
//     const deviceType = req.query.device_type || 'ALL';
//     const timeRange = req.query.time_range || 'daily';

//     const data = await service.getAssetHealthAlarmCount(deviceType, timeRange);
//     res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error fetching alarm count');
//   }
// }

async function getAssetHealth(req, res) {
  try {
    const deviceType = (req.query.device_type || 'ALL').toUpperCase();
    const timeRange = req.query.time_range || 'daily';
    const start_date =  `${req.query.start_date} 00:00:00`;
    const end_date = `${req.query.end_date} 23:59:59`;

    // Legacy service returns Promise → await works perfectly
    const data = await service.getAssetHealth(deviceType, start_date, end_date); 
    
    res.send({
      status: true,
      data
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      message: 'Asset Health API failed'
    });
  }
}










module.exports = {
  getSubsystemId,
  getxmapdatazoneid,
  getlast24hr,
  gethvacmapdatazoneid,
  getdevicedatazoneid,
  getAhuActualExpected,
  getAhuData,
  getAhuActualExpected1,
  getAhuDataLast1Hr,
  getVavDataLast1Hr,
  getEmsData,
  getEmsDeviceData,
  getEnergyDataLast1Hr,
  ems24hoursdata,
  ems7daysdata,
  getUpsDeviceData,
  getUpsDataLast1Hr,
  getcsuDataLast1Hr,
  getDeviceTimeSeriesData,
  getChillerDataLast1Hr,
  getCoolingTowerDataLast1Hr,
  commonGraphApiForAll,
  metricGraphApiForAll,
  getdevicedatabyzoneid,
  getDeviceDataLast1Hr,
  getEquipmentList,
  getParameterTypes,
  getTemperature,
  deviceParametersReports,
  //dailyenergyconsumptionforallem,
  energyConsumptionChart,
  getAssetHealthEnergy,
  getEnergyHeatmap,
  //assetHealthAlarmCount
  getAssetHealth
}
