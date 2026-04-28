const service = require('././schedule.service');
const { OK } = require('http-status');

const createWeeklySchedule = (req, res, next) => {
    let data = req.body
    service.createWeeklySchedule(data,(error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
      }
    });
  };

  const scheduleDetails = (req, res, next) => {
    let id=req.params.buildingId
    service.scheduleDetails(id,(error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
      }
    });
  };

  const holidaysList = (req, res, next) => {
    let data = req.body
    service.holidaysList(data,(error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
      }
    });
  };

  // const exceptionSchedule = (req, res, next) => {
  //   let data = req.body
  //   service.exceptionSchedule(data,(error, response) => {
  //     if (error) {
  //       next(error);
  //     } else {
  //       res.status(OK).json(response);
  //     }
  //   });
  // };
  const createSchedule=(req,res)=>{
    console.log(JSON.stringify(req.body["data"]))
    const data=req.body["data"]
    service.createSchedule(data,(err,resp)=>{
      if(err){
        console.log(err)
      }else{
        res.status(OK).json(resp);
      }
    })
  }


  const scheduleList=(req,res)=>{
    let id=req.params.buildingId
    service.scheduleList(id,(err,resp)=>{
      if(err){
        console.log(err)
      }else{
        res.status(OK).json(resp);
      }
    })
  }
module.exports ={
createWeeklySchedule,
scheduleDetails,
holidaysList,
createSchedule,
scheduleList
// exceptionSchedule
}