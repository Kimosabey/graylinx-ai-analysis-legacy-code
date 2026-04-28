const service = require('./PAS_service');
const { OK, CREATED, ACCEPTED } = require('http-status');

const responseFromFDD = (req,res,next)=>{
    let feature = req.body.feature
if(feature != "model_shift"){
    let trigger_id = req.body.request_uuid
    let res_data = req.body.serviceResults
    let alert_name =req.body.query_params.feature[0]
    console.log("body of response",req.body)
    // let parameter = req.body.post_body.parameter
    // console.log("pas_controller",trigger_id,res_data)
    service.responseFromFDD(trigger_id,res_data,alert_name,(err,result)=>{
        if(err){
            next(err)
        }else{
            res.sendStatus(ACCEPTED)
        }
    })
}else{
    let service_results = req.body.serviceResults
    // console.log("Information from pbs",equipment,model_name,feature,service_results)
    service.modelResponseFromFDD(service_results,(err,result)=>{
        if(err){
            next(err)
        }else{
            res.status(OK).json(result)
        }
    })
}
}


module.exports={
    responseFromFDD,
}