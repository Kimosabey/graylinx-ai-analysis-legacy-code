const { pool } = require('./Database/pool');
const fs = require('fs').promises;
const os = require('os');


// pool.getConnection((err,connection)=>{
//     if(connection){
//         const query=`WITH RECURSIVE subordinates AS (SELECT  id,name,ss_tag,ss_address_value,ss_type FROM gl_subsystem ss WHERE  id='f82ffed7-e02d-11ed-80f0-9829a659c337' UNION SELECT p.id,p.name,p.ss_tag,p.ss_address_value,p.ss_type FROM gl_subsystem p INNER JOIN subordinates s ON p.ss_parent = s.id) SELECT name, ss_type, ss_address_value,ss_tag FROM subordinates where ss_type="GL_SS_ADDRESS_BACNET_DDC" or ss_type is null limit 10;`;
//         connection.query(query,(err,res)=>{
//             connection.release();
//             if(err){
//                 console.log("i am err")
//             }else{
//                 console.log("restult",res.length)
//                 let myStr=""
//                 res.forEach((element,i)=> {
//                     console.log(`-----${i}-----`)
//                     if(element.ss_type=="GL_SS_ADDRESS_BACNET_DDC"){
//                         console.log(`-----${i}---ddc--`)
//                         myStr+=element.ss_address_value
//                     }else{
//                         console.log(`-----${i}--else---`)
//                         // 192.168.1.11:2001,5:20001,presentValue,
//                         myStr+=`,${element.ss_tag}:${element.ss_address_value},presntValue`
//                     }
//                 });
//                 console.log(myStr)
//                 myStr+="sudhu12345"
//                 const newline = os.EOL;
//                 fs.appendFile('reader.txt', newline+myStr)
//                 .then(() => {
//                     console.log('File written successfully');
//                 })
//                 .catch((err) => {
//                     console.error(err);
//                 });
//             }
//         })
//     }else{
//         console.log("DB CONNECTION ERRROR")
//     }
// })
function getMetricData(Id,ip) {
    console.log(`------------${Id}-----${ip}--------------`)
return new Promise((resolve, reject) => {
    pool.getConnection((err,connection)=>{
        if(connection){
            let metricQuery=`WITH RECURSIVE subordinates AS (SELECT  id,name,ss_tag,ss_address_value,ss_type FROM gl_subsystem ss WHERE  id=? UNION SELECT p.id,p.name,p.ss_tag,p.ss_address_value,p.ss_type FROM gl_subsystem p INNER JOIN subordinates s ON p.ss_parent = s.id) SELECT name, ss_type, ss_address_value,ss_tag FROM subordinates where ss_type="GL_SS_ADDRESS_BACNET_DDC" or ss_type is null`;
            connection.query(metricQuery,[Id],(err,res)=>{
                if(err){
                                     resolve(err)
                                    }else{
                                            let myStr=""
                                            let count=0
                                            myStr+=ip
                                            res.forEach((element,i)=> {
                                                if(element.ss_type !=="GL_SS_ADDRESS_BACNET_DDC"){
                                                    // myStr+=element.ss_address_value
                                                    myStr+=`,${element.ss_tag}:${element.ss_address_value},presentValue`
                                                    if (i % 10 !== 9 && i !== res.length - 1) {
                                                        myStr += '';
                                                    }
                                                    if (i % 10 === 9 && i !== res.length - 1) {
                                                        // myStr += os.EOL;
                                                        myStr += os.EOL+ip;
                                                    }
                                                }
                                                // else{
                                                //     myStr+=`,${element.ss_tag}:${element.ss_address_value},presentValue`
                                                //     count++

                                                // }
                                            });
                                            // Resolve the Promise with the metric data
                                            console.log("getMetricData---->",myStr)
                                             resolve(myStr);
                                            }
                                        })
        }
    })
    // executeSQLstatement(metricQuery,[Id],(err,res)=>{
    //         if(err){
    //                                 //   resolve(errData)
    //                                 resolve(err)
    //                                   // Handle the case where the table does not exist 
    //                             }else{
    //                                     // console.log(`---------------metric res${JSON.stringify(res)}`)
    //                                     let myStr=""
    //                                     res.forEach((element,i)=> {
    //                                         console.log(`-----${i}-----`)
    //                                         if(element.ss_type=="GL_SS_ADDRESS_BACNET_DDC"){
    //                                             console.log(`-----${i}---ddc--`)
    //                                             myStr+=element.ss_address_value
    //                                         }else{
    //                                             console.log(`-----${i}--else---`)
    //                                             // 192.168.1.11:2001,5:20001,presentValue,
    //                                             myStr+=`,${element.ss_tag}:${element.ss_address_value},presntValue`
    //                                         }
    //                                     });
    //                                     // Resolve the Promise with the metric data
    //                                      resolve(myStr);
    //                                     }
    //                                 })
});

}


const getDDC=async()=>{
    pool.getConnection(async(err,connection)=>{
        if(connection){
            const query=`select id,ss_address_value from gl_subsystem where ss_type="GL_SS_ADDRESS_BACNET_DDC" and ss_status='GL_SS_STATUS_ACTIVE';`
            connection.query(query,  async (err,res)=>{
                // connection.release()
                if(err){
                    console.log(err)
                }else{
                //    res.forEach(ele=>{
                //     let myoutput=await getMetricData(ele.id)
                //     console.log(`pro----${JSON.stringify(myoutput)}------`)
                //    })
                Promise.all(res.map(ele => getMetricData(ele.id,ele.ss_address_value).then(output => {
                    console.log(`pro----${JSON.stringify(output)}------`);
                    const newline = os.EOL;
                    fs.appendFile('reader.txt',output+newline)
                    .then(() => {
                        console.log('File written successfully');
                    })
                    .catch((err) => {
                        console.error(err);
                    });
                })))
                .then(() => {
                        // console.log(`then----${JSON.stringify(output)}------`);       
                        connection.release()
                    }
                    );
                }
            })
        }else{
            console.log("DB CONNECTION ERROR")
        }
    })
}





// function myappend(mycontent, myfile = 'mynewfile.txt') {
// 	fs.appendFile(myfile, mycontent, function (err) {
// 		if (err) throw err;
// 		mylog('Updated!');
// 	});
// }
getDDC()