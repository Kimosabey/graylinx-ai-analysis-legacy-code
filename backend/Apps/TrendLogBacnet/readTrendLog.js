const controller = require('./controller');
const axiosc = require('axios');
const http = require('http');
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });
const keepAliveAgent = new http.Agent({ keepAlive: true });
const schedule = require('node-schedule');
const authModel=require('../../Services/Auth/auth.modal')



const trendLog=()=>{
    controller.instancesInfo((error,result)=>{
        if(error){
            callback(error)
        }else{
            //console.log("-------->",result)
            //http://localhost:8080/readrange/192.168.10.30/20:1/logBuffer/t 2022-11-17 10:30:00 10
            let count=0
            // result.forEach(element => {
            //     if(element.lastUpTime){
            //         count++
            //          axios
            //     .get(`http://localhost:7080/readrange/${element.ip}/20:${element.instance}/logBuffer/t ${element.lastUpTime} 10`)
            //     .then((res)=>{
            //         console.log('----->',res.data)

            //     })
            //     .catch((err)=>{
            //         console.log(err)
            //       })
            //     }
                
            // });
            const inter = setInterval(() => {
                if(result[count].lastUpTime){
                    axios
                    .get(`http://localhost:7080/readrange/${result[count].ip}/20:${result[count].instance}/logBuffer/t ${result[count].lastUpTime} 10`)
                    .then((res) =>{
                        console.log(
                        `${new Date()} Status: success , action : MANUAL MODE `
                        )
                        if(count==result.length){
                            clearInterval(inter)
                            console.log("setting restart flag as false")
                            authModel.setServerStatus(0,(errorst,resultst)=>{
                                if(errorst){
                                    console.log("-----",errorst)
                                }else{
                                    console.log("restart flag is setted to false")
                                }
                            })
                        }
                    }
                    )
                    .catch((err) =>{ 
                        console.log(
                        "trend log request error"+err.message
                        )
                        if(count==result.length){
                            clearInterval(inter)
                            console.log("setting restart flag as false")
                            authModel.setServerStatus(0,(errorst,resultst)=>{
                                if(errorst){
                                    console.log("-----",errorst)
                                }else{
                                    console.log("restart flag is setted to false")
                                }
                            })
                        }
                    }
                    )
                }
                count++
            }, 2000);
        }
    })

}

//uncomment will running with device
schedule.scheduleJob(' */5 * * * * *', () => {
// schedule.scheduleJob('*/5 * * * *', () => {
controller.serverRestartStatus((err,result)=>{
    if(err){
        console.log("errorin restart status",err)
    }else{
        if(parseInt(result[0].param_value)){
            console.log("server restarted calling for trend log")
            trendLog()
        }else{
            console.log("server not restart")
        }
    }
})
   }

)

module.exports={
    trendLog
}