const model = require('./Gl_user.model');
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    // enter correct mail id and password here
    user: 'enter mail id',
    pass: 'enter correct password'
  }
});

const getTechnicians = (callback) => {
    model.getTechnicians((err, results) => {
      if (err) {
        callback(err);
      } else {
        callback(null,results);
      }
    });
  };

const sendToTechnicians = (data,callback) => {
generateMail(data,(err,res)=>{
  if(err){
    callback(err)
  }else{
    callback(null,'MAIL IS SENT')
  }
})
};

const generateMail=(data,callback)=>{
var alert_name = data.alarm_Synopsis
var device_name = data.device_Name
let count=0;
  let cause=''
  for(val in data.possible_Causes){
    cause+=`${val}:${data.possible_Causes[val]}\n`
    count++
    if(count == Object.keys((data.possible_Causes)).length){
      callback(null,cause)
    }
  }
  var mailOptions = {
    //enter your above mentioned mail id
    from: 'enter correct mail id',
    to:data.email,
    subject: 'Alert from '+device_name+'',
    text:
    'ALARM NAME : '+alert_name+'\n\n'+cause+'\n\nRegards,\nGraylinx Team'
  }
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log('error sending mail', error);
    } else {
        console.log("MAIL IS SENT")
        callback(null,"MAIL IS SENT")
    }
  });
}


const sendAlarmsToTechnicians = (data,callback) => {
  generateMailForAlarms(data,(err,res)=>{
    if(err){
      callback(err)
    }else{
      callback(null,'MAIL IS SENT')
    }
  })
  };

  const generateMailForAlarms=(data,callback)=>{
    let device_Name=data.Device_name
    let alert_name= data.alert_name
    let Description = data.Description
    let date=data.date
    let time = data.time
      var mailOptions = {
        //enter your above mentioned mail id
        from: 'enter correct mail id',
        to:data.email,
        subject: 'Alert from '+device_Name+'',
        text:
        'DEVICE NAME : '+device_Name+'\n\n'+'ALARM NAME : '+alert_name+'\n\n'+'DESCRIPTION : '+Description+'\n\n'+'DATE : '+date+'\n\n'+'TIME : '+time+'\n\n'+'\n\nRegards,\nGraylinx Team'
      }
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log('error sending mail', error);
        } else {
            console.log("MAIL IS SENT")
            callback(null,"MAIL IS SENT")
        }
      });
    }

    const configuration_values = (data,callback)=>{
      model.configuration_values(data,(err,res)=>{
        if(err){
          callback(err)
        }else{
          callback(null,res)
        }
      })
    }

    const instrumentation = (callback) => {
      model.instrumentation((err, results) => {
        if (err) {
          callback(err);
        } else {
          let graphData=[ {
           'cpu_usage':[],
           'memory_usage':[],
           'db_connections':[]
            }]

            for(let keysss in graphData[0]){
              results.forEach(obj=>{
                  if(obj.metric_id===keysss){
                        graphData[0][keysss].push(obj)  
                    }
                   })
                  } 
          let response={
            "graphData":graphData
          }
          callback(null,response);
        }
      });
    };

  module.exports={
    getTechnicians,
    sendToTechnicians,
    sendAlarmsToTechnicians,
    configuration_values,
    instrumentation
  }
