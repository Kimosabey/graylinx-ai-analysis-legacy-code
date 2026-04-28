const model = require('./model');
const bacnet = require('../../hvacBACnetClient');
const { compareAsc, format } = require('date-fns');
const player = require('node-wav-player');
const notifier = require('node-notifier');
const nodemailer = require('nodemailer');
const { default: axios } = require('axios');
const e = require('express');
var transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: 'srilakshmi.k@graylinx.ai',
      pass: 'please enter password'
    }
});


function generateMail(message,dev_name) {
    let count=0
                        model.getuser((err,result)=>{
                            if(err){
                                callback(err)
                            }else{
                                result.forEach(element=>{
                                    console.log("hi i am counttttttttttttttttttttttttt",count)
                                    console.log("-------->elelel",message)
                                    var mailOptions = {
                                        from:'srilakshmi.k@graylinx.ai' ,
                                        // to:'srilakshmi.k@graylinx.ai' ,
                                        // to: 'jahnavi.s@graylinx.ai',
                                        // 'nagesh.singapura@graylinx.ai'
                                        to:element.email,
                                        subject: 'Alert from device',
                                        text: 'Hi there is an alert '+message+' from '+dev_name+'\n\nRegards,\nGraylinx Team'
                                        // text: 'Hi'+element.email+'there is an alert'+message+'at'+time+'\n\nRegards,\nGraylinx Team'
                                    };
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                        console.log("error sending mail",error);
                                        } else {
                                        count=true
                                        console.log('Email sent: ' + info.response);
                                        count++;
                                        console.log("hi i am  mail sent counttttttttttttttttttttttttt",count)
                                        }
                                    })
                                }) 
                               
                            }
                        })
 
                        
}
const BacnetDeviceStatusNow = callback =>{
    model.getBacnetDeviceIp((err,results)=>{
        if(err){
            callback(err)
        }else{
            if(results){
                bacnet.discoverDevices((err,res)=>{
                    if(err){
                        console.log(err)
                    }else{
                        var r = results.filter(e => !res.find(a => e.ss_address_value === a.address));
                        var activeddc = results.filter(e=> res.find(el=>el.address==e.ss_address_value))
                         console.log("activeddc",activeddc)
                          console.log("r",r)
                          console.log("res",res)
                        if(r.length>0){
                                manageAlarm(r,(err,results1)=>{
                                    if(err){
                                        callback(err)
                                  }else{
                                callback(null,activeddc)
                                  }
                                })
                        }else{
                            const restored_time = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                            model.updateBacnetDeviceStatus(results, restored_time,(err2,result2)=>{
                                if(err2){
                                    callback(err2)
                                }else{
                                    callback(null,result2)
                                }
                            })
                        }
                    }
                })         
            }else{
                callback(null,"NO DDC REGISTERED")
            }
        }
    })
};


const manageAlarm=(issue,callback)=>{
    console.log("p-------isjsnjnsjnsnjsnjs",issue)
      let  toInsert=[] 
      let counti=0
       issue.forEach(element=>{
            model.DdcAlarmInfo(element.id,(err1,results1)=>{
                console.log("result1111",results1)
                if(err1){
                    callback(err1)
                }else{
                    if(results1.map(e=>e.acknowledged)==1){
                        console.log("Its Acknowledged")
                    }else{
                        console.log("not yet acknowledged")
                        notifier.notify(
                            {
                              //  title: 'notification',                
                              //  message: 'hello',
                              //  sound: true, // true | false.
                              //  time: 5000, // How long to show balloon in ms
                              //  wait: true, // Wait for User Action against Notification
                              //  type: 'info',
                                },
                               function(err, action) {
                                console.log('Action:', action);
                                if(action=="activate")
                                open('http://localhost:3000');
                             },
                             player.play({
                              path: './../../Images/Buzzer.wav',
                            }).then(() => {
                              console.log('Buzzer has started');
                            }).catch((error) => {
                              console.error(error);
                            })
                           );
                          
                    }
                    if(results1.length>0){
                        counti++
                        if(counti==issue.length){
                            console.log("ALARM IS ALREADY THERE")
                            // notifier.notify(
                            //     {
                            //       //  title: 'notification',                
                            //       //  message: 'hello',
                            //       //  sound: true, // true | false.
                            //       //  time: 5000, // How long to show balloon in ms
                            //       //  wait: true, // Wait for User Action against Notification
                            //       //  type: 'info',
                            //         },
                            //     //    function(err, action) {
                            //     //     console.log('Action:', action);
                            //     //     if(action=="activate")
                            //     //     open('http://localhost:3000');
                            //     //  },
                            //      player.play({
                            //       path: 'Buzzer.wav',
                            //     }).then(() => {
                            //       console.log('The wav file started to be played successfully.');
                            //     }).catch((error) => {
                            //       console.error(error);
                            //     })
                            //    );
                            callback(null,results1)
                        }
                    }else{
                            let a =[]
                            a.push(element.id)
                            a.push(101)
                            a.push("DDC_INACTIVE")
                            toInsert.push(a)
                        model.insertintoalarm(toInsert,(err2,results2)=>{
                            if(err2){
                                callback(err2)
                            }else{
                               counti++
                               console.log("ele12",element,toInsert)
                                var message=toInsert[0][2];
                                var dev_name=element.name;
                           generateMail(message,dev_name)
                                //      client.message.send({
                                //     channel : "whatsapp",
                                //     source : "918904661266",
                                //     destination : "918147453796",
                                //     'src.name': "devmessage",
                                //     message : {
                                //         isHSM: "true",
                                //         type: "text",
                                //         text: "Hi Sir/Madam, there is an alert from the device"
                                //     }
                                // }).then((response) => {
                                //     console.log("Template text message sent", response)
                                // }).catch(err => {
                                //     console.log("Template text message err:", err)
                                // })
                               if(counti==issue.length){
                                   callback(null,issue)
                                }
                            }
                        })
                    }
                
                }
            })
        })        
    }






module.exports = {
 BacnetDeviceStatusNow,
 generateMail
};
