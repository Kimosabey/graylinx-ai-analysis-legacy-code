const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const uuid = require('uuid/v4');
const { query } = require('../../Config/logger');
const _ = require('lodash');
const e = require('cors');

const createOrganization = (payload, callback) => {
    console.log("payload: ", payload)
    pool.getConnection((error, connection) => {
        if (connection) {
            connection.query("SELECT count(*) as count from gl_location WHERE name = ?", payload.name, (err1, result1) => {
                if (result1[0].count == 0) {
                    connection.query("INSERT INTO gl_location (id, name, zone_type, zone_status) VALUES (?,?,?,?)", [payload.id, payload.name, payload.zone_type, payload.zone_status], (err2, result2) => {
                        if (result2) {
                            connection.query("INSERT INTO gl_location_detail (id, zone_id) VALUES (?,?)", [uuid(), payload.id], (err3, result3) => {
                                if (result3) {
                                    logger.info("ACTION: Create Organization; ORG ID: " + payload.id +
                                        "; RESULT: Success; USER: admin; ROLE: super_admin")
                                    callback(null, payload.id);
                                }
                            })
                        }
                    })

                }
                else {
                    var err1 = new Error(`${payload.name} already exists`);
                    err1.status = 404;
                    logger.error("ACTION: Create Organization;" +
                        "; RESULT: Organization Name already exists; USER: admin; ROLE: super_admin")
                    callback(err1)
                }
            })
        }
        else {
            callback("DB connection error")
        }
    })
}

const createCampus = (payload, callback) => {
    console.log("payload: ", payload)
    pool.getConnection((error, connection) => {
        if (connection) {
            connection.query("SELECT count(*) as count from gl_location WHERE name = ? and zone_type = ?", [payload.name, payload.zone_type], (err1, result1) => {
                if (result1[0].count == 0) {
                    connection.query("INSERT INTO gl_location (id, name, zone_type, zone_status, zone_parent) VALUES (?,?,?,?,?)", [payload.id, payload.name, payload.zone_type, payload.zone_status, payload.zone_parent], (err2, result2) => {
                        if (result2) {
                            connection.query("INSERT INTO gl_location_detail (id, zone_id) VALUES (?,?)", [uuid(), payload.id], (err3, result3) => {
                                if (result3) {
                                    logger.info("ACTION: Create Campus; Campus ID: " + payload.id +
                                        "; RESULT: Success; USER: admin; ROLE: super_admin")
                                    callback(null, payload.id);
                                }
                            })
                        }
                    })

                }
                else {
                    var err1 = new Error(`${payload.name} already exists`);
                    err1.status = 404;
                    logger.error("ACTION: Create Campus;" +
                        "; RESULT: Campus Name already exists; USER: admin; ROLE: super_admin")
                    callback(err1)
                }
            })
        }
        else {
            callback("DB connection error")
        }
    })
}

const createBuilding = (payload, callback) => {
    console.log("payload: ", payload)
    pool.getConnection((error, connection) => {
        if (connection) {
            connection.query("SELECT count(*) as count from gl_location WHERE name = ? and zone_type = ?", [payload.name, payload.zone_type], (err1, result1) => {
                if (result1[0].count == 0) {
                    connection.query("INSERT INTO gl_location (id, name, zone_type, zone_status, zone_parent) VALUES (?,?,?,?,?)", [payload.id, payload.name, payload.zone_type, payload.zone_status, payload.zone_parent], (err2, result2) => {
                        if (result2) {
                            connection.query("INSERT INTO gl_location_detail (id, zone_id) VALUES (?,?)", [uuid(), payload.id], (err3, result3) => {
                                if (result3) {
                                    logger.info("ACTION: Create Building; Building ID: " + payload.id +
                                        "; RESULT: Success; USER: admin; ROLE: super_admin")
                                    callback(null, payload.id);
                                }
                            })
                        }
                    })

                }
                else {
                    var err1 = new Error(`${payload.name} already exists`);
                    err1.status = 404;
                    logger.error("ACTION: Create Building;" +
                        "; RESULT: Building Name already exists; USER: admin; ROLE: super_admin")
                    callback(err1)
                }
            })
        }
        else {
            callback("DB connection error")
        }
    })
}

const createFloor = (payload, callback) => {
    console.log("payload: ", payload)
    pool.getConnection((error, connection) => {
        if (connection) {
            connection.query("SELECT count(*) as count from gl_location WHERE name = ? and zone_type = ?", [payload.name, payload.zone_type], (err1, result1) => {
                if (result1[0].count == 0) {
                    connection.query("INSERT INTO gl_location (id, name, zone_type, zone_status, zone_parent) VALUES (?,?,?,?,?)", [payload.id, payload.name, payload.zone_type, payload.zone_status, payload.zone_parent], (err2, result2) => {
                        if (result2) {
                            payload.params.forEach(element => {
                                connection.query("INSERT INTO gl_location_detail (id, zone_id, param_name, param_value) VALUES (?,?,?,?)", [uuid(), payload.id, element.param_name, element.param_value], (err3, result3) => {
                                    console.log("result: ",result3)
                                    console.log("error: ",err3)
                                })
                                
                            });
                            setTimeout(() => {
                                logger.info("ACTION: Create Floor; Floor ID: " + payload.id +
                                            "; RESULT: Success; USER: admin; ROLE: super_admin")
                                callback(null, payload.id);
                            }, 500)
                        }
                    })

                }
                else {
                    var err1 = new Error(`${payload.name} already exists`);
                    err1.status = 404;
                    logger.error("ACTION: Create Floor;" +
                        "; RESULT: Floor Name already exists; USER: admin; ROLE: super_admin")
                    callback(err1)
                }
            })
        }
        else {
            callback("DB connection error")
        }
    })
}

const createZone = (payload, callback) => {
    console.log("payload: ", payload)
    pool.getConnection((error, connection) => {
        if (connection) {
            connection.query("SELECT count(*) as count from gl_location WHERE name = ? and zone_type = ?", [payload.name, payload.zone_type], (err1, result1) => {
                if (result1[0].count == 0) {
                    console.log("insert into GL_LOCATION")
                    connection.query("INSERT INTO gl_location (id, name, zone_type, zone_status, zone_parent, zone_shape, coords) VALUES (?,?,?,?,?,?,?)", [payload.id, payload.name, payload.zone_type, payload.zone_status, payload.zone_parent, payload.shape, (payload.coords).toString()], (err2, result2) => {
                        if (result2) {
                            console.log("inserted into GL_LOCATION")
                            if(payload.params) {
                                payload.params.forEach(element => {
                                    console.log("params: ",element.param_name)
                                    connection.query("INSERT INTO gl_location_detail (id, zone_id, param_name, param_value) VALUES (?,?,?,?)", [uuid(), payload.id, element.param_name, element.param_value], (err3, result3) => {
                                        console.log("result: ",result3)
                                        console.log("error: ",err3)
                                    })
                                    
                                });
                            }
                            setTimeout(() => {
                                logger.info("ACTION: Create Zone; Floor ID: " + payload.id +
                                            "; RESULT: Success; USER: admin; ROLE: super_admin")
                                callback(null, payload.id);
                            }, 500)
                        }
                        else {
                            console.log("err: ",err2)
                            callback(err2)
                        }
                    })

                }
                else {
                    var err1 = new Error(`${payload.name} already exists`);
                    err1.status = 404;
                    logger.error("ACTION: Create Floor;" +
                        "; RESULT: Zone Name already exists; USER: admin; ROLE: super_admin")
                    callback(err1)
                }
            })
        }
        else {
            callback("DB connection error")
        }
    })
}

const bookingList = (usage_type, callback) => {
    pool.getConnection((err, connection) => {
        if(connection) {
            var query;
            var booking_details = [];
            if(usage_type == "meeting_room") {
                query = `select zu.id, zu.zone_id, zu.user_id, zu.usage_start_time, zu.usage_end_time, z.name as zone_name, z.zone_parent from gl_location_user zu inner join gl_location z where usage_type = "meeting_room" and zu.zone_id = z.id`;
            }
            else if(usage_type == "seat") {
                query = `select zu.id, zu.zone_id, zu.user_id, zu.usage_start_time, zu.usage_end_time, z.name as zone_name, z.zone_parent from gl_location_user zu inner join gl_location z where usage_type = "seat" and zu.zone_id = z.id`;
            }
            connection.query(query, (error1, result1) => {
                if(result1.length > 0) {
                    result1.forEach(element => {
                        console.log(element)
                        var booking_detail = {};
                        booking_detail.id = element.id,
                        booking_detail.zone_name = element.zone_name,
                        booking_detail.usage_start_time = element.usage_start_time,
                        booking_detail.usage_end_time = element.usage_end_time
                        connection.query(`select name from gl_user where id = ?`, element.user_id, (error2, result2) => {
                            booking_detail.booked_by = result2[0].name
                        })
                        connection.query(`select name from gl_location where id = ?`, element.zone_parent, (error3, result3) => {
                            booking_detail.floor_name = result3[0].name
                        })
                        setTimeout(() => {
                            booking_details.push(booking_detail)
                        },100)
                    })
                    setTimeout(() => {
                        connection.release()
                        callback(null, booking_details)

                    },200)
                }   
            })
        }
        else {
            callback(null,"DB connection error")
        }
    })
}

const childGlZones = (parent_id, callback) => {
    pool.getConnection((err, connection) => {
        if(connection) {
            connection.query(`select * from gl_location where zone_parent = ?`, parent_id, (error1, result1) => {
                if(error1) {
                    connection.release()
                    callback(error1)
                }
                else {
                    callback(null, result1)
                }
            })
        }
        else {
            callback(null,"DB connection error")
        }
    })
}

const bookingStatus = (zone_id, payload, type, callback) => {
    //facilities = payload ? payload.facility: null;
    pool.getConnection((err, connection) => {
        if (connection) {
            const query = "select zu.id,zu.zone_id,zu.usage_start_time,zu.usage_end_time,zd.param_name,zd.param_value from gl_location_user zu inner join gl_location_detail zd where zu.zone_id = zd.zone_id and ((zu.usage_start_time BETWEEN '" + payload.from + "' AND '" + payload.to + "') OR (zu.usage_end_time BETWEEN '" + payload.from + "' AND '" + payload.to + "') OR ('" + payload.from + "' BETWEEN zu.usage_start_time AND zu.usage_end_time)) and zu.zone_id = ?"
            // console.log("============")
            //console.log(query)
            connection.query(query, [zone_id], (error1, result1) => {
                var obj = {}
                if (error1) {
                    connection.release()
                    console.log(error1)
                    callback(error1)
                }
                else if (result1.length > 0) {
                    connection.release()
                    if (type === "meeting-room") {
                        obj.id = result1[0].id
                        obj.zone_id = result1[0].zone_id
                        obj.usage_start_time = result1[0].usage_start_time
                        obj.usage_end_time = result1[0].usage_end_time
                        result1.forEach(zone => {
                            //console.log(zone.param_name, ": ", zone.param_value)
                            if (zone.param_name === "no_of_seats") {
                                obj.no_of_seats = zone.param_value
                            }
                            else if (zone.param_name === "description") {
                                obj.description = zone.param_value
                            }
                        })
                        callback(null, obj)
                    }
                    else {
                        callback(null, result1)
                    }
                }
            })
        }
        else {
            callback(null, "DB connection error")
        }
    })
}
const configuration = (glZone_id, param_name,param_value, callback) => {
    pool.getConnection((err,connection) => {
        if(connection) {
            const query = "SELECT * FROM gl_location_detail WHERE param_name = '"+param_name+"' AND zone_id = '"+glZone_id+"'";
            connection.query(query, (error, result) => {
                if(error) callback(error)
                else if(result.length > 0 ){
                    //update
                    connection.query("update gl_location_detail set param_value = ? where param_name = ? AND zone_id = ?", [param_value, param_name, glZone_id], (error1, result1) => {
                        if(error1) {
                            callback(error1)
                        }
                        else {
                            callback(null,{message: "Configuration successful"})
                        }
                    })
                }
                else {
                    //insert
                    connection.query("insert into gl_location_detail(id,param_name, param_value,zone_id) values (?,?,?,?)", [uuid(),param_name, param_value, glZone_id], (error2, result2) => {
                        if(error2) {
                            callback(error2)
                        }
                        else {
                            callback(null,{message: "Configuration successful"})
                        }
                    })
                }
            })
        }
        else {
            callback("DB connection error")
        }
    })

}
const cardsForDashboard = (glZone_id, callback) => {
    pool.getConnection((err,connection) => {
        if(connection) {
            const query = 'SELECT t1.name AS lev1, t2.name as lev2, t3.name as zone_name, t3.id as zone_id FROM gl_location AS t1 LEFT JOIN gl_location AS t2 ON t2.zone_parent = t1.id LEFT JOIN gl_location AS t3 ON t3.zone_parent = t2.id WHERE t1.id = ?';
            connection.query(query, glZone_id, (error1, result1) => {
                if(result1) {
                    count = 0;
                    var zones = []
                    result1.forEach(element => {
                        zones.push(element.zone_id)
                        count++;
                        if(count == result1.length) {
                            var cardsForDashboardObj = {}
                            connection.query('SELECT max(param_value) as tempMax, min(param_value) as tempMin, avg(param_value) as tempAvg FROM gl_device_operation WHERE zone_id IN (?) and param_name = "temperature"', [zones], (error2, result2) => {
                                if(error2) {
                                    console.log(error2)
                                }
                                else {
                                    cardsForDashboardObj.temperature = {"max": result2[0].tempMax, "min": result2[0].tempMin, "avg": result2[0].tempAvg}
                                }
                            })
                            connection.query('SELECT max(param_value) as humidityMax, min(param_value) as humidityMin, avg(param_value) as humidityAvg FROM gl_device_operation WHERE zone_id IN (?) and param_name = "humidity"', [zones], (error2, result2) => {
                                if(error2) {
                                    console.log(error2)
                                }
                                else {
                                    cardsForDashboardObj.humidity = {"max": result2[0].humidityMax, "min": result2[0].humidityMin, "avg": result2[0].humidityAvg}
                                }
                            })
                            connection.query('SELECT max(param_value) as luminousityMax, min(param_value) as luminousityMin, avg(param_value) as luminousityAvg FROM gl_device_operation WHERE zone_id IN (?) and param_name = "luminousity"', [zones], (error2, result2) => {
                                if(error2) {
                                    console.log(error2)
                                }
                                else {
                                    cardsForDashboardObj.luminousity = {"max": result2[0].luminousityMax, "min": result2[0].luminousityMin, "avg": result2[0].luminousityAvg}
                                }
                            })
                            connection.query('SELECT max(param_value) as co2Max, min(param_value) as co2Min, avg(param_value) as co2Avg FROM gl_device_operation WHERE zone_id IN (?) and param_name = "co2"', [zones], (error2, result2) => {
                                if(error2) {
                                    console.log(error2)
                                }
                                else {
                                    cardsForDashboardObj.co2 = {"max": result2[0].co2Max, "min": result2[0].co2Min, "avg": result2[0].co2Avg}
                                }
                            })
                            connection.query('SELECT max(param_value) as tvocMax, min(param_value) as tvocMin, avg(param_value) as tvocAvg FROM gl_device_operation WHERE zone_id IN (?) and param_name = "tvoc"', [zones], (error2, result2) => {
                                if(error2) {
                                    console.log(error2)
                                }
                                else {
                                    cardsForDashboardObj.tvoc = {"max": result2[0].tvocMax, "min": result2[0].tvocMin, "avg": result2[0].tvocAvg}
                                }
                            })
                            connection.query('SELECT max(param_value) as pm2_5Max, min(param_value) as pm2_5Min, avg(param_value) as pm2_5Avg FROM gl_device_operation WHERE zone_id IN (?) and param_name = "pm2.5"', [zones], (error2, result2) => {
                                if(error2) {
                                    console.log(error2)
                                }
                                else {
                                    cardsForDashboardObj["pm2.5"] = {"max": result2[0].pm2_5Max, "min": result2[0].pm2_5Min, "avg": result2[0].pm2_5Avg}
                                }
                            })
                            connection.query('SELECT max(param_value) as pm10Max, min(param_value) as pm10Min, avg(param_value) as pm10Avg FROM gl_device_operation WHERE zone_id IN (?) and param_name = "pm10"', [zones], (error2, result2) => {
                                if(error2) {
                                    console.log(error2)
                                }
                                else {
                                    cardsForDashboardObj["pm10"] = {"max": result2[0].pm10Max, "min": result2[0].pm10Min, "avg": result2[0].pm10Avg}
                                }
                            })
                            connection.query('SELECT max(param_value) as noiseMax, min(param_value) as noiseMin, avg(param_value) as noiseAvg FROM gl_device_operation WHERE zone_id IN (?) and param_name = "noise"', [zones], (error2, result2) => {
                                if(error2) {
                                    console.log(error2)
                                }
                                else {
                                    cardsForDashboardObj["noise"] = {"max": result2[0].noiseMax, "min": result2[0].noiseMin, "avg": result2[0].noiseAvg}
                                }
                            })
                            setTimeout(() => {
                                connection.release()
                                callback(null, cardsForDashboardObj)
                            },200)
                        }
                    })
                }
                else {
                    connection.release()
                    callback(null, "No child zone")
                }
            })
        }   
        else {
            callback("DB connection error")
        }
    })

}
const confRoomFacility = (glZone_id, callback) => {
    pool.getConnection((err,connection) => {
        if(connection) {
            const query = 'SELECT t1.name AS lev1, t2.name as zone_name, t2.id as zone_id FROM gl_location AS t1 LEFT JOIN gl_location AS t2 ON t2.zone_parent = t1.id WHERE t1.id = ? and t2.zone_type = ?'
            console.log(query)
            connection.query(query, [glZone_id, "meeting-room"], (error1, result1) => {
                if(result1){
                    var set1 = new Set();
                    result1.forEach(element => {
                        connection.query('select * from gl_location_detail where param_name = "description" and zone_id = ?', element.zone_id, (error2, result2) => {
                            if(result2) {
                                facilityArr = result2[0].param_value.split(",")
                                facilityArr.forEach(facility => {
                                    set1.add(facility.trim())
                                })
                            }
                            
                        })
                        
                    })
                    setTimeout(() => {
                        callback(null, {facilities: JSON.parse(JSON.stringify(Array.from(set1)))})
                    },200)
                }
            })
        }   
        else {
            callback("DB connection error")
        }
    })

}

const seatCheck = (glZone_id, no_of_seats, callback) => {
    pool.getConnection((err,connection) => {
        if(connection) {
            //check the wastage of building
            //check with the no of seats
            //bookable true/false
        }   
        else {
            callback("DB connection error")
        }
    })
}

const getUser = (email, callback) => {
    pool.getConnection((err,connection) => {
        if(connection) {
            //var users = []
            const query1 = `select gu.name as name, gu.id as user_id, gup.param_name,gup.param_value from gl_user gu inner join gl_user_profile gup where gu.id = gup.user_id and gup.user_id IN (SELECT user_id FROM gl_user_profile WHERE param_value like "`+email+`%")`;
            console.log(query1)
            connection.query(query1, (error1, result1) =>  {
                if(error1) {
                    callback(error1)
                }
                else {
                    let records = result1.filter(e => e.param_name == "contact_no" || e.param_name == "email")
                    console.log(records)
                    callback(null, records)
                }
            });    
        }   
        else {
            callback("DB connection error")
        }
    })
}

const booking = (payload, callback) => {
    console.log("booking: ",payload)
    console.log(payload.booking_details[0].zone_id)
    console.log(payload.booking_details[0].params[0].param_name)
    pool.getConnection((error, connection) => {
        if(connection) {
            const query = "Insert into gl_location_user(id, zone_id, user_id, usage_start_time, usage_end_time) values(?,?,?,?,?)";
            payload.zone_type == "meeting-room" ? 
            connection.query(query, [
                uuid(),
                payload.booking_details[0].zone_id,
                payload.booking_details[0].user_id,
                payload.booking_details[0].duration_from,
                payload.booking_details[0].duration_to,
            ], (error, result) => {
                if(error) {
                    console.log(error)
                }
                else {
                    console.log("GL_LOCATION_User updated")
                }
            }) : console.log("zone type is not meeting-room")
        }
        else {
            callback(null, "DB connection error")
        }
    })
}
module.exports = {
    createOrganization,
    createCampus,
    createBuilding,
    createFloor,
    createZone,
    bookingList,
    childGlZones,
    bookingStatus,
    configuration,
    cardsForDashboard,
    confRoomFacility,
    seatCheck,
    getUser,
    booking
};