const { OK, CREATED, ACCEPTED } = require('http-status');
const service = require('./bacnet.service');
const logger = require('../../Config/logger');
const { validationResult } = require('express-validator');


const readproperty = (req,res, next) => {
     console.log("req",req.params)
    //  console.log("req",req)
    // (mytarget, mytype, myinstance, mypropertyid)
    const mytarget = req.params.mytarget;
    const  myType = req.params.mytype;
    const myinstance = req.params.myinstance;
    const mypropertyid = req.params.mypropertyid;
    service.readproperty(mytarget, myType, myinstance, mypropertyid, (error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
        // console.log("response",response)
      }
    });
};

const writeproperty = (req,res,next) =>{
    const mytarget = req.params.mytarget;
    const objtype = req.params.objtype;
    const objInstance = req.params.objInstance;
    const propertyId = req.params.propertyId;
    const propertyArray = req.body;
    console.log("controller",mytarget, objtype, objInstance, propertyId,propertyArray);
     console.log("--------------------------------",propertyArray)
    service.writeproperty(mytarget, objtype, objInstance, propertyId, propertyArray,(error,response)=>{
        if (error) {
            next(error);
          } else {
            res.status(OK).json(response);
            console.log("response",response)
          }
    })
}




module.exports = {
    readproperty,
    writeproperty,
}



