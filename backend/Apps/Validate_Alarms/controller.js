const model = require('./model');
const nodemailer = require('nodemailer');
const axios = require('axios');
var transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: 'rakesh.ng@graylinx.ai',
    pass: 'R@khi@1998'
  }
});

const getLatestValuesForAlarm = (id, callback) => {
  model.getLatestValuesForAlarm(id, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const getInputValuesForAlarm = (id, callback) => {
  model.getInputValuesForAlarm(id, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const alarmToValidate = callback => {
  model.alarmToValidate((err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const alarmToValidateDsp = callback => {
  model.alarmToValidateDsp((err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const alarmToValidateZnt = callback => {
  model.alarmToValidateZnt((err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

function generateMail(message,callback) {
  let count = 0;
  model.getuser((err, result) => {
    if (err) {
      callback(err);
    } else {
      result.forEach(element => {
       var alert_name = Object.keys(message)[0]
       var alert_causes = Object.values(message)[0]
        let count1=0;
        let cause=''
        for(val in alert_causes){
          // console.log(`vallll,${val}:${data.possible_Causes[val]}`)
          cause+=`${val}:${alert_causes[val]}\n`
          count1++
          if(count1 == Object.keys((alert_causes)).length){
            callback(null,cause)
          }
        }
        // console.log("cause",cause)
        // var mailOptions = {
        //   from: 'rakesh.ng@graylinx.ai',
        //     to:'rakeshng25@gmail.com' ,
        //     // to: element.email,
        //   subject: 'Alert from device',
        //   text:
        //  'ALARM NAME : '+alert_name+'\n\n'+cause+'\n\nRegards,\nGraylinx Team'
        // };
        // transporter.sendMail(mailOptions, function(error, info) {
        //   if (error) {
        //     console.log('error sending mail', error);
        //   } else {
        //     count = true;
        //     // console.log('Email sent: ' + info.response);
        //     console.log("MAIL IS SENT")
        //     count++;
        //     if(count == result.length){
        //       console.log("MAIL IS SENT")
        //       callback(null,"MAIL IS SENT")
        //     }
        //     // console.log(
        //     //   'hi i am  mail sent counttttttttttttttttttttttttt',
        //     //   count
        //     // );
        //   }
        // });
      });
    }
  });
}

const sendWhatsAppMsg = (data,callback) =>{
  let my_headers={'Authorization': 'Bearer EAALGHv8RLBkBOy6mEaxjxigzRn92L2Sm0tH8Uw9E3CLUzZAC6pCje9BtrfsRNexDpiXulUA88nh73lSlEue5gwYZC0tgCHOlxAgKdItRTdIOQnrouUFhZAZArGazdn5eO7FNu21fNtu45RzY2HxDxSZCZCgiLKFRxZB92Id0TBq1BgZBQcrbhrJEda1tjMBrz1ufXvdfZAp2hhER3w9PSNX9kadLCe726kmcGsIEZD','Content-Type': 'application/json'}
  let my_token= ''
  let my_body={"messaging_product":"whatsapp","to":"919845083647","type":"template","template":{"name":"application_status","language":{"code":"en"},"components":[{"type":"header","parameters":[{"type":"text","text":"Dr. Raghunandan Srinath"}]},{"type":"body","parameters":[{"type":"text","text":"1 from GL_App"},{"type":"text","text":"2 from GL_App"}]}]}}
  let url = "https://graph.facebook.com/v17.0/109165125614998/messages" 
  axios.post(url,my_body,{headers:my_headers})
    .then(gl_response => {
      console.log(gl_response.data)
    })
    .catch(gl_err =>{
      console.log("sendWhatsAppMsg",gl_err)
    })
}

const validatedAlarm = (id,callback) => {
  model.validatedAlarm(id,(err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const update_causes = (data,id,callback)=>{
  model.update_causes(data,id,(err,results)=>{
    if(err){
      callback(err)
    }else{
      callback(null,results)
    }
  })
};

const restoreAlarm = (id,callback) => {
  model.restoreAlarm(id,(err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const getParent = (id,callback) =>{
  model.getParent(id,(err,result)=>{
    if(err){
      callback(err)
    }else{
      callback(null, result)
    }
  })
}

const addTriggerId = (id,ala_id,callback)=>{
  model.addTriggerId(id,ala_id,(err,result)=>{
    if(err){
      callback(err)
    }else{
      callback(null, result)
    }
  })
}

const feedbackFrom = (callback)=>{
  model.feedbackFrom((err,result)=>{
    if(err){
      callback(err)
    }else{
      callback(null, result)
    }
  })
}

const getPasPort = (callback)=>{
  model.getPasPort((err,result)=>{
    if(err){
      callback(err)
    }else{
      callback(null,result)
    }
  })
}

const updateModifiedTime = (mod_time,ala_id,callback)=>{
  model.updateModifiedTime(mod_time,ala_id,(err,result)=>{
    if(err){
      callback(err)
    }else{
      callback(null,result)
    }
  })
}
module.exports = {
  getLatestValuesForAlarm,
  getInputValuesForAlarm,
  alarmToValidate,
  alarmToValidateDsp,
  alarmToValidateZnt,
  generateMail,
  validatedAlarm,
  update_causes,
  restoreAlarm,
  getParent,
  sendWhatsAppMsg,
  addTriggerId,
  feedbackFrom,
  getPasPort,
  updateModifiedTime
};
