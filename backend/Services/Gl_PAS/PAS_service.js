const model = require('./PAS_model');
const nodemailer = require('nodemailer');
const { format, parseISO } = require('date-fns');
var transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: 'rakesh.ng@graylinx.ai',
    pass: 'R@khi@1998'
  }
});

const responseFromFDD = (id,data,alert_name,callback)=>{
// console.log("service",id,data)
// console.log("valve_stuck=======>",data.result.valve_stuck)
// console.log("coil_efficiency===========>",data.result.CHW)
// console.log("load_issue=======>",data.result.load_issue)
// console.log("IWT_setpoint==========>",data.result.IWT_setpoint)
// console.log("CHW_PID===========>",data.result.CHW_PID)
// console.log("sensor_fault=============>",data.result.sensor_fault)
console.log("Chiller FDD ====>",data.result.Reason)
model.getalarmId(id,(err1,res1)=>{
    if(err1){
        callback(err1)
    }else{
        let causes = {};
        let obj = {};
        //  console.log("ressssssss",res1[0].Alarm_id)
        if('valve_stuck' in data.result){
          if(data.result.valve_stuck == "faulty"){
            obj['Chilled Water Control Valve Operation'] = 'Faulty'
          }else{
            obj["Chilled Water Control Valve Operation"]="Fine"
          }
        }
        if('CHW' in data.result){
          if(data.result.CHW == "faulty"){
            obj["Coil efficiency"]='Faulty'
          }else{
            obj["Coil efficiency"]="Fine"
          }
        }
        if('IWT_setpoint' in data.result){
          if(data.result.IWT_setpoint == "faulty"){
            obj["Chilled water inlet temperature"] = 'Faulty'
          }else{
            obj["Chilled water inlet temperature"] = 'Fine'
          }
        }
        if('load_issue' in data.result){
          if(data.result.load_issue == "faulty"){
            obj["Cooling load within limits"] = 'Faulty'
          }else{
            obj["Cooling load within limits"] ="Fine"
          }
        }
        if('CHW_PID' in data.result){
          if(data.result.CHW_PID == "faulty"){
            obj["PID control function"] = 'Faulty'
          }else{
            obj["PID control function"] = 'Fine'
          }
        }
        if('sensor_fault' in data.result){
          if(data.result.sensor_fault == "faulty"){
            obj["Functionality of Sensors"] = 'Faulty'
          }else{
            obj["Functionality of Sensors"] = 'Fine'
          }
        }
        if('leaky_valve' in data.result){
          if(data.result.leaky_valve == "faulty"){
            obj["Chilled water valve health"] = 'Faulty'
          }else{
            obj["Chilled water valve health"] = 'Fine'
          }
        }
        if('RPM' in data.result){
          if(data.result.RPM == "faulty"){
            obj["Fan Speed"] = 'Faulty'
          }else{
            obj["Fan Speed"] = 'Fine'
          }
        }
        if('RPM_PID' in data.result){
          if(data.result.RPM_PID == "faulty"){
            obj["Fan Control"] = 'Faulty'
          }else{
            obj["Fan Control"] = 'Fine'
          }
        }
        if('duct_leak' in data.result){
          if(data.result.duct_leak == "faulty"){
            obj["Duct health"] = 'Faulty'
          }else{
            obj["Duct health"] = 'Fine'
          }
        }
        if('FAN_POWER' in data.result){
          if(data.result.FAN_POWER == "faulty"){
            obj["Fan efficiency"] = 'Faulty'
          }else{
            obj["Fan efficiency"] = 'Fine'
          }
        }
        if('ZONE_SAT_mismatch' in data.result){
          if(data.result.ZONE_SAT_mismatch == "faulty"){
            obj["SAT mismatch"] = 'Faulty'
          }else{
            obj["SAT mimsatch"] = 'Fine'
          }
        }
        if('ZONE_DSP_mismatch' in data.result){
          if(data.result.ZONE_DSP_mismatch == "faulty"){
            obj["DSP mismatch"] = 'Faulty'
          }else{
            obj["DSP mismatch"] = 'Fine'
          }
        }
        if('ZONE_damper_stuck' in data.result){
          if(data.result.ZONE_damper_stuck == "faulty"){
            obj["VAV damper stuck"] = 'Faulty'
          }else{
            obj["VAV damper stuck"] = 'Fine'
          }
        }
        if('ZONE_load_sensor_fault' in data.result){
          if(data.result.ZONE_damper_stuck == "faulty"){
            obj["Sensor fault"] = 'Faulty'
          }else{
            obj["Sensor fault"] = 'Fine'
          }
        }
        if('ZONE_DUCT_PID_issue' in data.result){
          if(data.result.ZONE_DUCT_PID_issue == "faulty"){
            obj["VAV PID issue"] = 'Faulty'
          }else{
            obj["VAV PID issue"] = 'Fine'
          }
        }
        if('Condenser_Fouling' in data.result){
          if(data.result.Condenser_Fouling == "faulty"){
            obj["Condenser Fouling"] = 'Faulty'
          }else{
            obj["Condenser_Fouling"] = 'Fine'
          }
        }
        if('High_Charge' in data.result){
          if(data.result.High_Charge == "faulty"){
            obj["High Charge"] = 'Faulty'
          }else{
            obj["High Charge"] = 'Fine'
          }
        }
        if('Evaporator_Fouling' in data.result){
          if(data.result.Evaporator_Fouling == "faulty"){
            obj["Evaporator Fouling"] = 'Faulty'
          }else{
            obj["Evaporator Fouling"] = 'Fine'
          }
        }
        if('Low_Charge' in data.result){
          if(data.result.Low_Charge == "faulty"){
            obj["Low Charge"] = 'Faulty'
          }else{
            obj["Low Charge"] = 'Fine'
          }
        }
        if('Exp_Valve_High' in data.result){
          if(data.result.Exp_Valve_High == "faulty"){
            obj["Expansion Valve High Malfunction"] = 'Faulty'
          }else{
            obj["Expansion Valve High Malfunction"] = 'Fine'
          }
        }
        if('Exp_Valve_Low' in data.result){
          if(data.result.Exp_Valve_Low == "faulty"){
            obj["Expansion Valve Low Malfunction"] = 'Faulty'
          }else{
            obj["Expansion Valve Low Malfunction"] = 'Fine'
          }
        }
        if('Compressor_Fault' in data.result){
          if(data.result.Compressor_Fault == "faulty"){
            obj["Compressor Fault"] = 'Faulty'
          }else{
            obj["Compressor Fault"] = 'Fine'
          }
        }
          causes[alert_name] = obj;
           console.log("Im here",causes)
          if(res1.length > 0){
            model.update_causes(causes,res1[0].Alarm_id,(err,resup)=>{
              if(err){
                callback(err)
              }else{
                  // generateMail(causes, (err, resend) => {
                  //     if (err) {
                  //         callback(err);
                  //     } else {
                  //         callback(null, 'Alert sent');
                  //     }
                  // });
                callback(null, causes);        
              }
            })  
          }else{
            callback(null,"NO ALARM ID FOR THIS CAUSES")
          }
    }
})

}

function generateMail(message,callback) {
  console.log("Message",message)
  let count = 0;
  model.getuser((err, result) => {
    if (err) {
      callback(err);
    } else {
      var alert_name = Object.keys(message)[0]
      var alert_causes = Object.values(message)[0]
      let count1=0;
      console.log("alert_name",alert_name)
      let cause=''
      for(val in alert_causes){
        // console.log(`vallll,${val}:${data.possible_Causes[val]}`)
        cause+=`${val}:${alert_causes[val]}\n`
        count1++
        if(count1 == Object.keys((alert_causes)).length){
          callback(null,cause)
        }
      }
      console.log("cause",cause)
      // result.forEach(element => {
        var mailOptions = {
          from: 'rakesh.ng@graylinx.ai',
            // to:'raghunandan.srinath@graylinx.ai' ,
            to:'moses.n@graylinx.ai',
            // to: element.email,
          subject: 'Alert from device',
          text:
         'ALARM NAME : '+alert_name+'\n\n'+cause+'\n\nRegards,\nGraylinx Team'
        };
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log('error sending mail', error);
          } else {
            count = true;
            // console.log('Email sent: ' + info.response);
            // console.log("MAIL IS SENT")
            count++;
            if(count == result.length){
              console.log("MAIL IS SENT")
              callback(null,"MAIL IS SENT")
            }
            // console.log(
            //   'hi i am  mail sent counttttttttttttttttttttttttt',
            //   count
            // );
          }
        });
      // });
    }
  });
}

const modelResponseFromFDD = (service_results,callback)=>{
 const equipment = service_results.equipment
 if(equipment != undefined){
   model.getAhuId(equipment,(err,result)=>{
     if(err){
       callback(err)
     }else{
       const model_name = service_results.model
         if(result.length > 0){
           const deviceId = result[0].id
           const message = model_name +" model is shifted"
           const validate = service_results.result.moved
           const reasons = service_results.result.status
           const transformedResponse = reasons.reduce((result,cause) => {
             result[cause.info] = cause.status;
             return result;
           }, {});
           const possible_causes = [transformedResponse];
           console.log("possible_causes ==> ",deviceId,JSON.stringify(possible_causes))        
           if(validate === true){
             console.log(`AHU ID : ${deviceId}, Message : ${message}, possible_causes : ${possible_causes}`);
             model.insertIntoAlarm(deviceId,message,possible_causes,(err,results)=>{
             if(err){
               callback(err)
             }else{
                 callback(null,"Accepted")
               }
             })
             // callback(null,"Accepted")
           }else{
             callback(null,"No movement in Model shift")
           }
         }else{
           callback(null,"No Device Found")
       }
     }
   })
 }else{
  callback(null, "Device not found");
 }
}


module.exports={
    responseFromFDD,
    generateMail,
    modelResponseFromFDD
}