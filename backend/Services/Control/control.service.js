const axiosc = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });
const logger = require('../../Config/logger');

const model = require('./control.model');

const zoneLights = (event, user, callback) => {
  model.gatewayDetails((error, result) => {
    if (error) {
      callback(error);
    } else {
      const zoneId = event.zones[0];
      const master = event.master;
      model.daliSlaves(zoneId, (err, response) => {
        if (err) {
          callback(err);
        } else {
          const gatewayIp = result.filter(
            each => each.zone_id === event.zones[0]
          )[0].ip;
          const slaves = response
            .filter(each => each.mac.slice(-6, -2) === master.slice(-4))
            .map(each => parseInt(each.mac.slice(-2), 16));
          axios
            .post(`https://${gatewayIp}/api/daliGroupControl`, {
              daliMaster: master,
              selection: 'slaves',
              action: event.action,
              slaves: slaves,
              intensity: event.intensity
            })
            .then(() => {
              logger.info("ACTION: Zone Level Light Control  ZONE ID: "+zoneId+
                " DALI MASTER: "+master+" LIGHT CONTROL: "+event.action+
                " RESULT: Success"+
                " USER: "+user.name+" USER ID: "+user.id)
              callback(null, { message: 'success' })
            })
            .catch(err1 => {
              logger.info("ACTION: Zone Level Light Control  ZONE ID: "+zoneId+
                " DALI MASTER: "+master+" LIGHT CONTROL: "+event.action+
                " RESULT: Failed"+
                " USER: "+user.name+" USER ID: "+user.id)   
              callback(err1)});
        }
      });
    }
  });
};

const indiviualLights = (event,user, callback) => {
  model.gatewayDetails((error, result) => {
    if (error) {
      callback(error);
    } else {
      const gatewayIp = result.filter(
        each => each.zone_id === event.zones[0]
      )[0].ip;
      axios
        .post(`https://${gatewayIp}/api/daliGroupControl`, {
          daliMaster: event.master,
          selection: 'slaves',
          action: event.action,
          slaves: event.slaves,
          intensity: event.intensity
        })
        .then(() => {
          logger.info("ACTION: Invidual Light Control  LIGHTS: "+event.slaves+
            " DALI MASTER: "+event.master+" LIGHT CONTROL: "+event.action+
            " RESULT: Success"+
            " USER: "+user.name+" USER ID: "+user.id)
          callback(null, { message: 'success' })
        })
        .catch(err => { 
          logger.info("ACTION: Invidual Light Control  LIGHTS: "+event.slaves+
            " DALI MASTER: "+event.master+" LIGHT CONTROL: "+event.action+
            " RESULT: Failed"+
            " USER: "+user.name+" USER ID: "+user.id)
          callback(err)});
    }
  });
};

const anclLights = (event,user, callback) => {
  model.gatewayDetails((error, result) => {
    if (error) {
      callback(error);
    } else {
      const gatewayIp = result.filter(
        each => each.zone_id === event.zones[0]
      )[0].ip;

      var mode_payload = {
        device: {
          macId: event.master
        },
        command: {
          type: event.type,
          channel: event.channel
        }
      }

      console.log("mode payload: \n", mode_payload)
      console.log("action payload: \n",{
        device: {
          macId: event.master
        },
        command: { 	
          channelSelection : event.channel, 
          control : event.control,
          intensity : event.intensity
        }
      })

      axios
        .post(`https://${gatewayIp}/api/analogCtrldeviceTypeSelection`, mode_payload)
        .then(() => {
          logger.info("ACTION: Analog Controller Mode Selection: "+event.type+
          " ANALOG CONTROLLER: "+event.master+
            " RESULT: Success"+
            " USER: "+user.name+" USER ID: "+user.id)
          if(event.type == 0){
            callback(null, { message: 'success' })
          } else {
            // var action_payload = {
            //   device: {
            //     macId: event.master
            //   },
            //   command: { 	
            //     channelSelection : event.channel, 
            //     control : event.control,
            //     intensity : event.intensity
            //   }
            // }

            axios
              .post(`https://${gatewayIp}/api/analogCtrlChannelControl`, mode_payload)
              .then(() => {
                logger.info("ACTION: Analog Controller's Channel Control: "+event.control+
                " ANALOG CONTROLLER: "+event.master+" CHANNELS: "+event.channel+
                  " RESULT: Success"+
                  " USER: "+user.name+" USER ID: "+user.id)
                callback(null, { message: 'success' })
              })
              .catch(err => { 
                logger.info("ACTION: Analog Controller's Channel Control: "+event.control+
                " ANALOG CONTROLLER: "+event.master+" CHANNELS: "+event.channel+
                  " RESULT: Success"+
                  " USER: "+user.name+" USER ID: "+user.id)
                callback(err)
              });
          }

        })
        .catch(err => { 
          logger.info("ACTION: Analog Controller Mode Selection: "+event.type+
          " ANALOG CONTROLLER: "+event.master+
            " RESULT: Success"+
            " USER: "+user.name+" USER ID: "+user.id)
          callback(err)
        });
    }
  });
};

const zoneAnctlLights = (event,user, callback) => {
  model.gatewayDetails((error, result) => {
    if (error) {
      callback(error);
    } else {
      const gatewayIp = result.filter(
        each => each.zone_id === event.zones[0]
      )[0].ip;
      
      axios
        .post(`https://${gatewayIp}/api/wacChannelSelection`, {
          type: event.type,
          master: event.master
        })
        .then((resp) => {
          if(resp.data.failed || resp.data.returnCode == -2){
            logger.info("ACTION: Zone | Device Analog Controller's Channel Control: "+event.control+
            " ANALOG CONTROLLERS: "+event.master+" CHANNELS: "+event.channel+
              " RESULT: Failed"+
              " USER: "+user.name+" USER ID: "+user.id)
              callback({error: "Error"})
          } else {
            logger.info("ACTION: Zone | Device Analog Controller Mode Selection: "+event.type+
            " ANALOG CONTROLLERS: "+event.master+
            " RESULT: Success"+
            " USER: "+user.name+" USER ID: "+user.id)
          }
          
          if(event.type == 0){
            callback(null, { message: 'success' })
          } else {
            axios
            .post(`https://${gatewayIp}/api/wacGroupControl`, {
              channel: event.channel, 
              control: event.control,
              intensity: event.intensity,
              master: event.master
              })
              .then((resp_two) => {
                console.log(resp_two)
                if(resp_two.data.failed || resp_two.data.returnCode == -2){
                  logger.info("ACTION: Zone | Device Analog Controller's Channel Control: "+event.control+
                  " ANALOG CONTROLLERS: "+event.master+" CHANNELS: "+event.channel+
                  " RESULT: Failed"+
                  " USER: "+user.name+" USER ID: "+user.id)
                  callback({error: "Error"})
                } else {
                  logger.info("ACTION: Zone | Device Analog Controller's Channel Control: "+event.control+
                  " ANALOG CONTROLLERS: "+event.master+" CHANNELS: "+event.channel+
                    " RESULT: Success"+
                    " USER: "+user.name+" USER ID: "+user.id)
                  callback(null, { message: 'success' })
                }
              })
              .catch(err => { 
                logger.info("ACTION: Zone | Device Analog Controller's Channel Control: "+event.control+
                " ANALOG CONTROLLERS: "+event.master+" CHANNELS: "+event.channel+
                  " RESULT: Failed"+
                  " USER: "+user.name+" USER ID: "+user.id)
                callback(err)
              });
          }

        })
        .catch(err => { 
          logger.info("ACTION: Analog Controller Mode Selection: "+event.type+
          " ANALOG CONTROLLER: "+event.master+
            " RESULT: Success"+
            " USER: "+user.name+" USER ID: "+user.id)
          callback(err)
        });
    }
  });
};


const control = (event,user,glZoneId,callback) => {
  model.gatewayDetails((error, result) => {
    if (error) {
      callback(error);
    } else {
      const gatewayIp = result.filter(
        each => each.zone_id === event.zone
      )[0].ip;


        
      let payload = {}
      let dali_str = ""
      let ac_str = ""
      if (event.DALI) {
        let masters = []
        event.DALI.dali.forEach((each, i) => {
          masters.push(each.macId)
          let up_slaves = []
          each.slaves.forEach((slaveMac, j) => {
            // if (each.macId.slice(-4) == slaveMac.substring(10, 14)) {
              up_slaves.push(parseInt(slaveMac.slice(-2), 16))
              // }
              
          })
          each.slaves = up_slaves
        })
        payload["DALI"] = event.DALI

        dali_str += "ACTION: Light Control  DALI MASTERS: "+masters
        event.DALI.mode == 'manual' ? dali_str += " LIGHT MODE: Manual LIGHT CONTROL: "+event.DALI.intensity : dali_str += " LIGHT MODE: Auto"
      } 

      if (event.WAC) {
        payload["WAC"] = event.WAC
        var analog_controllers= event.WAC.wac.map(element => element.macId);
        ac_str += "ACTION: Light Control  ANALOG CONTROLLERS: "+analog_controllers
            event.WAC.mode == 'manual' ? ac_str += " LIGHT MODE: Manual LIGHT CONTROL: "+event.WAC.intensity : ac_str += " LIGHT MODE: Auto"
      }

      axios
        .post(`https://${gatewayIp}/api/WLMSGroupControl`, payload)
        .then((resp) => {
          if(resp.data.returnCode == 0) {
            if(event.DALI && event.WAC) {
              if(resp.data.DALI.failure || resp.data.WAC.failure) {
                dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(dali_str)
                ac_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(ac_str)
                callback(null, {message: "failure", response: resp.data.WAC})
                // callback({message: "failure", response: resp})
              } else {
                dali_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(dali_str)
                ac_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(ac_str)
                callback(null, { message: 'success' })
              }
            }else if(event.DALI){
              if(resp.data.DALI.failure) {
                dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(dali_str)
                callback(null, {message: "failure", response: resp.data.DALI})
              } else {
                dali_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(dali_str)
                callback(null, {message: "success"})
              }
            } else if(event.WAC) {
              if(resp.data.WAC.failure) {
                ac_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(ac_str)
                callback(null, {message: "failure", response: resp.data.WAC})
              } else {
                ac_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(ac_str)
                callback(null, {message: "success"})
              }
            }
          } else if(resp.data.returnCode == -1) {
            callback(null, {message: "failure"})
          }
          // callback(null, { message: 'success' })
        })
        .catch(err => { 
          if(event.DALI && event.WAC) {
            dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
            logger.info(dali_str)
            ac_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
            logger.info(ac_str)
          }else if(event.DALI){
            dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
            logger.info(dali_str)
          } else if(event.WAC) {
            ac_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
            logger.info(dali_str)
          }
          callback({message: "failure"})
        });
    }
  });
};


module.exports = {
  indiviualLights,
  zoneLights,
  anclLights,
  zoneAnctlLights,
  lights
};
