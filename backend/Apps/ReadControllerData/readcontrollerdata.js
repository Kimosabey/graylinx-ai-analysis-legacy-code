const schedule = require('node-schedule');
 const controller = require('./controller');
const async = require('async');
const { response } = require('express');
const hvacBACnetClient=require('../../hvacBACnetClient');
const { json } = require('body-parser');
const { set } = require('lodash');


schedule.scheduleJob('*/20 * * * * *', () => {
async.waterfall(
    [
        callback =>{
            controller.instancesInfo((err,results)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
           },
           (response,callback)=>{
               let payload={}
               let finArr=[]
               let ip=response.map(data=>data.ip)
               let ip_lst_set=new Set(ip);
               const ip_list = [...ip_lst_set];
               let ipCount=0
               ip_list.forEach(ip=>{
                       let instanceList=[]
                       instanceList=response.filter(data=>data.ip==ip)
                       payload[ip]=instanceList
                       ipCount++
                       if(ipCount==ip_list.length){
                        //console.log("i am payload",payload)
                        let payKeyCount=0
                        for(var i in payload){
                            let reqObj=[]
                            let countReq=0
                            payload[i].forEach(element=>{
                                     let myobj1={}
                                     let myobj2={}                                     
                                    myobj1["type"]= parseInt(element.type)
                                    myobj1["instance"]=parseInt(element.instance)
                                    let idArray =[{id:77},{id:85}]
                                    myobj2["objectId"]=myobj1
                                    myobj2["properties"]= idArray
                                    reqObj.push(myobj2)
                                    countReq++
                                    if(countReq==payload[i].length){
                                    hvacBACnetClient.myReadPropertyMultiple1(i,reqObj,(err,results)=>{
                        if(err){
                            callback(err)
                        }else{
                            finArr.push.apply(finArr, results)
                            payKeyCount++  
                            if(payKeyCount==Object.keys(payload).length){
                                controller.addData(finArr,response,(err,results)=>{
                                    if(err){
                                        callback(err)
                                    }else{
                                        callback(null,results)
                                    }
                                })
                            }
                        }
                    })
                                    }
                                
                            })
                        }
                       }

               })
        } 
    ]
)
})