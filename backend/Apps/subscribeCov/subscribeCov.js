const controller = require('./controller');
const axiosc = require('axios');
const http = require('http');
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });
const keepAliveAgent = new http.Agent({ keepAlive: true });






//http://localhost:8080/subscribeCoV/192.168.1.44/2:1

const subscribeCov=()=>{
        controller.instancesInfo((error,result)=>{
            if(error){
                callback(error)
            }else{
                //console.log("-------->", JSON.stringify(result))
               // let count=0
            //     result.forEach(element => {
    
            //  // console.log(`http://localhost:7080/subscribe/${element.ip}/${element.type}:${element.instance}`)
            //         axios
            //         .get(`http://localhost:7080/subscribe/${element.ip}/${element.type}:${element.instance}`)
            //         .then((res)=>{
            //             count++
            //             console.log("------------>then block",count)
            //         })
            //     });
            let count=0
            const intervalId = setInterval(() => {
                console.log('counter',count)
                axios
                .get(`http://localhost:7080/subscribe/${result[count].ip}/${result[count].type}:${result[count].instance}`)
                .then((res)=>{
                    console.log("------------>then block",count)
                    if (count === result.length) {
                      console.log('Clearing the interval id after count executions');
                      logger.info("all devices completed for subscribe"+printDate())
                      clearInterval(intervalId);
                    }
                })
                .catch((err)=>{
                    if (count === result.length) {
                        console.log('Clearing the interval id after count executions');
                        //logger.info("all devices completed storing COV"+printDate())
                        clearInterval(intervalId);
                      }
                })
                count++
              }, 300);
            }
        })

}

subscribeCov()

module.exports={
    subscribeCov
}