const model = require('./model')

const getLast1HrData = (id,table_name,param_id,callback)=>{
    model.getLast1HrData(id,table_name,param_id,(err,res)=>{
        if(err){
            callback(err)
        }else{
            callback(null,res)
        }
    })
}

const insertIntoMetricTable = (id,metricvalue,table_name,ss_type,callback)=>{
    model.insertIntoMetricTable(id,metricvalue,table_name,ss_type,(err,res)=>{
        if(err){
            callback(err)
        }else{
        model.addCumilativeDataForCPM(id,metricvalue,table_name,ss_type,(err,res)=>{
            if(err){
                callback(err)
            }else{
                callback(null,res)
            }
        })
        }
    })
}

const getCumilativeMetricData = (table_name,interval,metric_id,callback)=>{
    model.getCumilativeMetricData(table_name,interval,metric_id,(err,res)=>{
        if(err){
            callback(err)
        }else{
            callback(null,res)
        }
    })
}

const addCumilativeMetricDataToTable = (data,table_name,measured_time,ss_type,callback) =>{
    model.addCumilativeMetricDataToTable(data,table_name,measured_time,ss_type,(err,res)=>{
        if(err){
            callback(err)
        }else{
            callback(null,res)
        }
    })
}

module.exports = {
    getLast1HrData,
    insertIntoMetricTable,
    getCumilativeMetricData,
    addCumilativeMetricDataToTable
}