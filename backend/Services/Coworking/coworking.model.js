const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const { data } = require('../../Config/logger');
const uuid = require('uuid/v4');
const { response } = require('express');
const _ = require('lodash');

const meetingRoomBooking = (payload, callback) => {
    console.log("payload: ",payload)
    pool.getConnection((err, connection) => {
        if (connection) {

            connection.query('INSERT INTO GL_LOCATION_user(id,zone_id, user_id, usage_start_time, usage_end_time, usage_type) VALUES(?,?,?,?,?,?)', [payload.id, payload.meeting_room_id, payload.user_id, payload.duration_from, payload.duration_to, payload.usage_type], (error1,result1) => {
                if (error1) {
                    connection.release();
                    callback(error1);
                } else {
                    payload.params.forEach(element => {
                        connection.query('INSERT INTO GL_LOCATION_user_detail(id, usage_id, param_name, param_value) VALUES (?,?,?,?)', [uuid(), payload.id, element.param_name, element.param_value], (error2, result2) => {

                        })
                    });
                    setTimeout(() => {
                        // logger.info("ACTION: Create Floor; Floor ID: " + payload.id +
                        //             "; RESULT: Success; USER: admin; ROLE: super_admin")
                        connection.release();
                        callback(null, payload.otp);
                    }, 500) 
                }
            });

        } else {
            callback(err);
        }
    });
};

const updateBooking = (payload, callback) => {
    console.log(payload.booking_ids[0].id)
    pool.getConnection((err, connection) => {
        if (connection) {
            const query = `select usage_start_time from GL_LOCATION_user where id = ?`
            connection.query(query, payload.booking_ids[0].id, (error, response1) => {
                if(error) {
                    connection.release()
                    callback(error1);
                }
                else {
                    console.log("response: ",response1)
                    let prev_from_date = new Date(response1[0].usage_start_time);
                    let currDate = new Date()
                    if(currDate > prev_from_date) {
                        connection.release()
                        callback(null, "Meeting has been Started")
                    }
                    else {
                        payload.booking_ids.forEach(element => {
                            connection.query(`update GL_LOCATION_user set usage_start_time = ?, usage_end_time =? where id = ?`, [payload.duration_from, payload.duration_to, element.id], (error2, response2) => {
                                if(error2) {
                                    connection.release()
                                    callback(error2)
                                }
                            })
                        })
                        setTimeout(() => {
                            connection.release()
                            callback(null, "success")
                        },500)
                    }
                }
            })
        } else {
            callback(err);
        }
    });
};

const cancelBooking = (payload, callback) => {
    pool.getConnection((err, connection) => {
        if (connection) {
            console.log("id: ",payload.booking_ids[0].id)
            const query = `select usage_start_time from GL_LOCATION_user where id = ?`
            connection.query(query, payload.booking_ids[0].id, (error, response1) => {
                if(error) {
                    connection.release()
                    callback(error1);
                }
                else {
                    let prev_from_date = new Date(response1[0].usage_start_time);
                    let currDate = new Date()
                    if(currDate > prev_from_date) {
                        connection.release()
                        callback(null, "Meeting has been Started")
                    }
                    else {
                        payload.booking_ids.forEach(element => {
                            connection.query(`delete from GL_LOCATION_user where id = ?`, [element.id], (error2, response2) => {
                                if(error2) {
                                    connection.release()
                                    callback(error2)
                                }
                            })
                        })
                        setTimeout(() => {
                            connection.release()
                            callback(null, "Booking Cancelled")
                        },500)
                    }
                }
            })
        } else {
            callback(err);
        }
    });
};
const floorList = (buildingID, callback) => {
    pool.getConnection((err, connection) => {
        if (connection) {
            connection.query('SELECT * FROM floor WHERE building_id = ?', buildingID, (error1, result) => {
                connection.release();
                if (error1) {
                    callback(error1);
                } else {
                    connection.release();
                    // logger.info("ACTION: Create Floor; FLOOR ID: " + payload.id +
                    //     "; RESULT: Success; USER: admin; ROLE: super_admin")
                    callback(null, "success");
                }
            });

        } else {
            callback(err);
        }
    });
};

const meetingRoomList = (floor_id, payload, callback) => {
    facilities = payload.facility;
    pool.getConnection((err, connection) => {
        let unOccupiedZones = [];
        if (connection) {
            var query = "select * from zone where floor_id = '"+floor_id+"' and type = 'meeting_room'";
            if(!facilities) {
            }
            else if(typeof facilities == "string") {
                query+= "and description like '%"+facilities+"%'"
            }
            else {
                facilities.forEach(facility => {
                    query+= "and description like '%"+facility+"%'"
                })
            }
            connection.query(query, (error1, zones) => {
                if(error1)
                {
                    callback(error1)
                }
                else{

                    zones.forEach(element => {
                            const query1 = "SELECT *  FROM meeting_room_booking WHERE meeting_room_id = '"+element.id+"' AND (duration_from BETWEEN '"+payload.from+"' AND '"+payload.to+"' OR duration_to BETWEEN '"+payload.from+"' AND '"+payload.to+"')";
                            connection.query(query1, (error2, occupiedRoom) => {
                                if(error2)
                                {
                                    console.log(error2)
                                }
                                else {
                                    if(occupiedRoom.length == 0)
                                    {
                                        unOccupiedZones.push({
                                            id: element.id,
                                            name: element.name,
                                            cost: element.cost,
                                            seats: element.no_of_seats,
                                            description: element.description
                                        })

                                    }
                                }
                            })
                        
                    });
                    setTimeout(function(){
                        callback(null,unOccupiedZones)
                    },500)
                }
            })

        } else {
            callback(err);
        }
    });
};

const hotDeskingList = (floor_id, payload, callback) => {
    pool.getConnection((err, connection) => {
        let unOccupiedZones = [];
        if (connection) {
            const query = "select * from zone where floor_id = '"+floor_id+"' and type = 'co_working'";
            connection.query(query, (error1, zones) => {
                if(error1)
                {
                    callback(error1)
                }
                else{

                    zones.forEach(element => {
                            const query1 = "SELECT *  FROM hot_desking WHERE zone_id = '"+element.id+"' AND (duration_from BETWEEN '"+payload.from+"' AND '"+payload.to+"' OR duration_to BETWEEN '"+payload.from+"' AND '"+payload.to+"')";
                            connection.query(query1, (error2, occupiedZone) => {
                                if(error2)
                                {
                                    console.log(error2)
                                }
                                else {
                                    if(occupiedZone.length == 0)
                                    {
                                        unOccupiedZones.push({
                                            id: element.id,
                                            name: element.name,
                                            cost: element.cost,
                                            seats: element.no_of_seats,
                                            description: element.description
                                        })

                                    }
                                }
                            })
                        
                    });
                    setTimeout(function(){
                        callback(null,unOccupiedZones)
                    },500)
                }
            })

        } else {
            callback(err);
        }
    });
};

const bookedSeatList = (floor_id, payload, callback) => {
    pool.getConnection((err, connection) => {
        if (connection) {
            const query = "select * from zone where floor_id = '"+floor_id+"' and type = 'co_working'";
            connection.query(query, (error1, zones) => {
                if(error1)
                {
                    callback(error1)
                }
                else{

                    occupiedZonesTemp = [];
                    zones.forEach(element => {
                            let query1 = payload ? "SELECT *  FROM hot_desking WHERE zone_id = '"+element.id+"' AND ((duration_from BETWEEN '"+payload.from+"' AND '"+payload.to+"') OR (duration_to BETWEEN '"+payload.from+"' AND '"+payload.to+"') OR ('"+payload.from+"' BETWEEN duration_from AND duration_to))" : `select * from hot_desking where now() >= duration_from and now() <= duration_to and zone_id = "${element.id}"`;
                            connection.query(query1, (error2, occupiedZone) => {
                                if(error2)
                                {
                                    console.log(error2)
                                }
                                else {
                                    
                                    if(occupiedZone.length > 0)
                                    {   
                                        occupiedZone.forEach(occ_zone => {
                                            occupiedZonesTemp.push({
                                                zone_id: occ_zone.zone_id,
                                                seat_details: JSON.parse(occ_zone.seat_details)
                                            })
                                        })
                                        

                                    }
                                }
                            })
                        });
                    setTimeout(function(){
                        callback(null,occupiedZonesTemp)
                    },500)
                }
            })

        } else {
            callback(err);
        }
    });
};

const bookedMeetingRoomList = (floor_id, payload, callback) => {
    
    facilities = payload ? payload.facility: null;
    pool.getConnection((err, connection) => {
        if (connection) {
            var query = "select * from zone where floor_id = '"+floor_id+"' and type = 'meeting_room'";
            if(!facilities) {
            }
            else if(typeof facilities == "string") {
                query+= "and description like '%"+facilities+"%'"
            }
            else {
                facilities.forEach(facility => {
                    query+= "and description like '%"+facility+"%'"
                })
            }
            console.log("query: ",query)
            connection.query(query, (error1, zones) => {
                if(error1)
                {   
                    connection.release()
                    callback(error1)
                }
                else{
                    occupiedZonesTemp = [];
                    zones.forEach(element => {
                            let query1 = payload ? "SELECT *  FROM meeting_room_booking WHERE meeting_room_id = '"+element.id+"' AND ((duration_from BETWEEN '"+payload.from+"' AND '"+payload.to+"') OR (duration_to BETWEEN '"+payload.from+"' AND '"+payload.to+"') OR ('"+payload.from+"' BETWEEN duration_from AND duration_to))" : `select * from meeting_room_booking where now() >= duration_from and now() <= duration_to and meeting_room_id = "${element.id}"`;
                            connection.query(query1, (error2, occupiedZone) => {
                                if(error2)
                                {
                                    callback(error2)
                                }
                                else {
                                    occupiedZone.length > 0 ? occupiedZonesTemp.push(occupiedZone[0]) : ""
                                }
                            })
                        });
                    setTimeout(() => {
                        callback(null, occupiedZonesTemp)
                    }, 1000)    
                }
            })

        } else {
            callback(err);
        }
    });
};

const hotDesking = (payload, callback) => {
    pool.getConnection((err, connection) => {
        if (connection) {
            payload.seat_ids.forEach(seat => {
                id = uuid(),
                connection.query('INSERT INTO GL_LOCATION_user(id,zone_id, user_id, usage_start_time, usage_end_time, usage_type) VALUES(?,?,?,?,?,?)', [id, seat.id, payload.user_id, payload.duration_from, payload.duration_to, payload.usage_type], (error1,result1) => {
                    if (error1) {
                        console.log(error1)
                        connection.release();
                        callback(error1);
                    } else {
                        if(payload.params) {
                            payload.params.forEach(element => {
                                connection.query('INSERT INTO GL_LOCATION_user_detail(id, usage_id, param_name, param_value) VALUES (?,?,?,?)', [uuid(), id, element.param_name, element.param_value], (error2, result2) => {
        
                                })
                            });
                        }
                        
                    }
                });
            })
            setTimeout(() => {
                // logger.info("ACTION: Create Floor; Floor ID: " + payload.id +
                //             "; RESULT: Success; USER: admin; ROLE: super_admin")
                connection.release();
                callback(null, payload.otp);
            }, 500) 
        } else {
            callback(err);
        }
    });
};

const configuration = (zone_id, values, callback) => {
    pool.getConnection((err, connection) => {
        if (connection) {
            connection.query('UPDATE zone SET configuration = ? WHERE id = ?',[JSON.stringify(values),zone_id], error1 => {
                connection.release();
                if (error1) {
                    callback(error1);
                } else {
                    connection.release()
                    // logger.info("ACTION: Create Floor; FLOOR ID: " + payload.id +
                    //     "; RESULT: Success; USER: admin; ROLE: super_admin")
                    callback(null, "success");
                }
            });

        } else {
            callback(err);
        }
    });
};

const getClientDetails = (email, callback) => {
    pool.getConnection((err, connection) => {
        if(connection) {
            connection.query('SELECT * FROM cws_users WHERE user_email like ?', email+"%", (error, result) => {
                if(error) {
                    connection.release()
                    callback(error)
                }
                else {
                    connection.release()
                    callback(null, result)
                }
            })
        }
        else {
            callback(err)
        }
    });
}

const cwsUsers = (callback) => {
    pool.getConnection((err, connection) => {
        if(connection) {
            connection.query('SELECT * FROM cws_users order by user_id', (error, result) => {
                if(error) {
                    connection.release()
                    callback(error)
                }
                else {
                    connection.release()
                    callback(null, result)
                }
            })
        }
        else {
            callback(err)
        }
    });
}

const deleteCwsUsers = (email, callback) => {
    pool.getConnection((err, connection) => {
        if(connection) {
            connection.query('DELETE FROM cws_users WHERE user_email = ?',email, (error, result) => {
                if(error) {
                    connection.release()
                    callback(error)
                }
                else {
                    if (result.affectedRows === 1) {
                        logger.info("ACTION: Delete User; RESULT: Success; USER EMAIL: "+email)
                        callback({ message: 'User Deleted Successfully', status: 200 });
                      } else {
                        logger.error("ACTION: Delete User; RESULT: User not found; EMAIL: "+email)
                        callback({ message: 'User Not Found', status: 404 });
                      }
                }
            })
        }
        else {
            callback(err)
        }
    });
}

const uploadCWSUsersData = (payload, callback) => {
    pool.getConnection((err, connection) => {
        if (connection) {
            let query = "INSERT INTO cws_users (cws_users.user_id, cws_users.user_name, cws_users.user_email, cws_users.user_contact_no) VALUES ? ON DUPLICATE KEY UPDATE cws_users.user_name = VALUES(cws_users.user_name),cws_users.user_contact_no = VALUES(cws_users.user_contact_no)";
            // let query = "INSERT INTO cws_users (cws_users.user_id, cws_users.user_name, cws_users.user_email, cws_users.user_contact_no) VALUES ('"+payload.user_id+"', '"+payload.user_name+"', '"+payload.user_email+"', '"+payload.user_contact_no+"') ON DUPLICATE KEY UPDATE cws_users.user_name = VALUES(cws_users.user_name),cws_users.user_contact_no = VALUES(cws_users.user_contact_no)";
            connection.query(query,[payload], error1 => {
                connection.release();
                if (error1) {
                    console.log(error1)
                    callback(error1);
                } else {
                    // connection.release();
                    // logger.info("ACTION: Create Floor; FLOOR ID: " + payload.id +
                    //     "; RESULT: Success; USER: admin; ROLE: super_admin")
                    callback(null, "Data successfully added!!");
                }
            });

        } else {
            callback(err);
        }
    });
};

const getFloorMapDetails = (floorId, callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
        const sql =
        'select floor_map_details from floor where id=?';
        connection.query(sql, [floorId], (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.length === 0) {
              callback({ message: 'Floor not found', status: 404 });
            } else {
              callback(null, results);
            }
          }
        });
      } else {
        callback(err);
      }
    });
}

const getNetworkStatus = (callback) => {
    pool.getConnection((err, connection) => {
        if (err) {
            return callback(err);
        }

        const parentQuery = `SELECT id, name, ss_address_value FROM gl_subsystem WHERE ss_type="GL_SS_SERVER"`;

        connection.query(parentQuery, (queryErr, parentResults) => {
            if (queryErr) {
                connection.release();
                return callback(queryErr);
            }

            const results = [];

            const getLastChildren = (cpm, done) => {
                const lastChildrenQuery = `
                    SELECT DISTINCT gs.id, gs.name, gs.ss_type, gs.ss_address_value, gs.ss_parent, 
                                    gsle.param_id, gsle.param_value
                    FROM gl_subsystem gs
                    INNER JOIN gl_subsystem_latest_event gsle 
                    ON gs.ss_parent = gsle.ss_id
                    WHERE gs.ss_parent = ? 
                    AND gs.name IN ('BYPASS_HEADER_VLV_FBK', 'CWH_FLOW_MONITORING', 'HUMIDITY_MONITORING') 
                    AND gs.name = gsle.param_id 
                    ORDER BY gs.ss_address_value ASC 
                    LIMIT 10`;

                connection.query(lastChildrenQuery, [cpm.id], (lastChildrenErr, lastChildrenResults) => {
                    if (lastChildrenErr) {
                        return done(lastChildrenErr);
                    }

                    lastChildrenResults = lastChildrenResults.map(child => ({
                        ...child,
                        value: formatValue(child.param_value) // Format the param_value
                    }));

                    done(null, { ...cpm, children: lastChildrenResults });
                });
            };

            const getDdcChildren = (ddc, done) => {
                const queries = [
                    { type: "NONGL_SS_CPM", query: `SELECT id, name, ss_type FROM gl_subsystem WHERE ss_type="NONGL_SS_CPM" AND ss_parent=? ORDER BY name` },
                    { type: "NONGL_SS_PRIMARY_VARIABLE_PUMPS", query: `SELECT id, name, ss_type FROM gl_subsystem WHERE ss_type="NONGL_SS_PRIMARY_VARIABLE_PUMPS" AND ss_parent=? ORDER BY name` },
                    { type: "NONGL_SS_SECONDARY_PUMPS", query: `SELECT id, name, ss_type FROM gl_subsystem WHERE ss_type="NONGL_SS_SECONDARY_PUMPS" AND ss_parent=? ORDER BY name` },
                    { type: "NONGL_SS_AIR_COOLED_CHILLER", query: `SELECT id, name, ss_type FROM gl_subsystem WHERE ss_type="NONGL_SS_AIR_COOLED_CHILLER" AND ss_parent=? ORDER BY name` },
                    { type: "NONGL_SS_DPT_DEVICE", query: `SELECT id, name, ss_type FROM gl_subsystem WHERE ss_type="NONGL_SS_DPT_DEVICE" AND ss_parent=? ORDER BY name` }
                ];
            
                let completedQueries = 0;
                let allChildren = [];
            
                queries.forEach(({ type, query }) => {
                    connection.query(query, [ddc.id], (err, results) => {
                        if (err) {
                            return done(err);
                        }
            
                        if (type === "NONGL_SS_CPM") {
                            let completedCpmQueries = 0;
                            const cpmList = [];
            
                            if (results.length === 0) {
                                allChildren.push(...results);
                                completedQueries++;
                                if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                                return;
                            }
            
                            results.forEach(cpm => {
                                getLastChildren(cpm, (err, cpmWithChildren) => {
                                    if (err) return done(err);
            
                                    cpmList.push(cpmWithChildren);
                                    completedCpmQueries++;
            
                                    if (completedCpmQueries === results.length) {
                                        allChildren.push(...cpmList);
                                        completedQueries++;
                                        if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                                    }
                                });
                            });
                        } 
                        else if (type === "NONGL_SS_PRIMARY_VARIABLE_PUMPS") {
                            let completedPumpQueries = 0;
                            const pumpList = [];
            
                            if (results.length === 0) {
                                allChildren.push(...results);
                                completedQueries++;
                                if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                                return;
                            }
            
                            results.forEach(pump => {
                                getPrimaryVariablePumpsChildren(pump, (err, pumpWithChildren) => {
                                    if (err) return done(err);
            
                                    pumpList.push(pumpWithChildren);
                                    completedPumpQueries++;
            
                                    if (completedPumpQueries === results.length) {
                                        allChildren.push(...pumpList);
                                        completedQueries++;
                                        if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                                    }
                                });
                            });
                        } 
                        else if (type === "NONGL_SS_SECONDARY_PUMPS") {
                            let completedPumpQueries = 0;
                            const secondPumpList = [];
                        
                            if (results.length === 0) {
                                allChildren.push(...results);
                                completedQueries++;
                                if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                                return;
                            }
                        
                            results.forEach(pump1 => {
                                getSecondaryVariablePumpsChildren(pump1, (err, pumpWithChildren) => {
                                    if (err) return done(err);
                        
                                    secondPumpList.push(pumpWithChildren);
                                    completedPumpQueries++;
                        
                                    if (completedPumpQueries === results.length) {
                                        allChildren.push(...secondPumpList);
                                        completedQueries++;
                                        if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                                    }
                                });
                            });
                        }
                        else if (type === "NONGL_SS_AIR_COOLED_CHILLER") {
                            let completedPumpQueries = 0;
                            const AirCooledChiller = [];
                        
                            if (results.length === 0) {
                                allChildren.push(...results);
                                completedQueries++;
                                if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                                return;
                            }
                        
                            results.forEach(chiller1 => {
                                getAirCooledChillerChildren(chiller1, (err, chillerWithChildren) => {
                                    if (err) return done(err);
                        
                                    AirCooledChiller.push(chillerWithChildren);
                                    completedPumpQueries++;
                        
                                    if (completedPumpQueries === results.length) {
                                        allChildren.push(...AirCooledChiller);
                                        completedQueries++;
                                        if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                                    }
                                });
                            });
                        }
                        else if (type === "NONGL_SS_DPT_DEVICE") {
                            let completedPumpQueries = 0;
                            const DPT = [];
                        
                            if (results.length === 0) {
                                allChildren.push(...results);
                                completedQueries++;
                                if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                                return;
                            }
                        
                            results.forEach(dpt => {
                                getdptChildren(dpt, (err, dptWithChildren) => {
                                    if (err) return done(err);
                        
                                    DPT.push(dptWithChildren);
                                    completedPumpQueries++;
                        
                                    if (completedPumpQueries === results.length) {
                                        allChildren.push(...DPT);
                                        completedQueries++;
                                        if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                                    }
                                });
                            });
                        }
                        
                        else {
                            allChildren.push(...results);
                            completedQueries++;
                            if (completedQueries === queries.length) done(null, { ...ddc, children: allChildren });
                        }
                    });
                });
            };
            
            // Function to fetch children for NONGL_SS_PRIMARY_VARIABLE_PUMPS
            const getPrimaryVariablePumpsChildren = (pump, done) => {
                const primaryPumpsQuery = `
                    SELECT DISTINCT gs.id, gs.name, gs.ss_type, gs.ss_address_value, gs.ss_parent, 
                                    gsle.param_id, gsle.param_value 
                    FROM gl_subsystem gs 
                    INNER JOIN gl_subsystem_latest_event gsle 
                    ON gs.ss_parent = gsle.ss_id 
                    WHERE gs.ss_parent = ? 
                    AND gs.name IN ('PriV_Pmp_On_Off_SS', 'PriV_Pmp_Trip_SS', 'PriV_Pmp_VFD_Fbk')
                    AND gs.name = gsle.param_id 
                    ORDER BY gs.ss_address_value ASC LIMIT 10`;
            
                connection.query(primaryPumpsQuery, [pump.id], (err, pumpChildren) => {
                    if (err) {
                        return done(err);
                    }
                    pumpChildren = pumpChildren.map(child => ({
                        ...child,
                        value: formatValue(child.param_value) // Format the param_value
                    }))
            
                    done(null, { ...pump, children: pumpChildren });
                });
            };
            const getSecondaryVariablePumpsChildren = (pump1, done) => {
                const secondaryPumpsQuery = `
                    SELECT DISTINCT gs.id, gs.name, gs.ss_type, gs.ss_address_value, gs.ss_parent, 
                                    gsle.param_id, gsle.param_value 
                    FROM gl_subsystem gs 
                    INNER JOIN gl_subsystem_latest_event gsle 
                    ON gs.ss_parent = gsle.ss_id 
                    WHERE gs.ss_parent = ? 
                    AND gs.name IN ('SecV_Pmp_On_Off_SS', 'SecV_Pmp_Trip_SS','SecV_Pmp_VFD_Fbk')
                    AND gs.name = gsle.param_id 
                    ORDER BY gs.ss_address_value ASC LIMIT 10`;
            
                connection.query(secondaryPumpsQuery , [pump1.id], (err, pumpChildren) => {
                    if (err) {
                        return done(err);
                    }

                    pumpChildren = pumpChildren.map(child => ({
                        ...child,
                        value: formatValue(child.param_value) // Format the param_value
                    }))
            
                    done(null, { ...pump1, children: pumpChildren });
                });
            };
            const getAirCooledChillerChildren = (chiller1, done) => {
                const airCooledChillerQuery = `
                    SELECT DISTINCT gs.id, gs.name, gs.ss_type, gs.ss_address_value, gs.ss_parent, 
                                    gsle.param_id, gsle.param_value 
                    FROM gl_subsystem gs 
                    INNER JOIN gl_subsystem_latest_event gsle 
                    ON gs.ss_parent = gsle.ss_id 
                    WHERE gs.ss_parent = ? 
                    AND gs.name IN ('CH_On_Off_SS', 'CH_Out_Vlv_On_Off_SS', 'CH_Trip_SS', 'CH_Run_SS') 
                    AND gs.name = gsle.param_id 
                    ORDER BY gs.ss_address_value ASC 
                    LIMIT 10`;
            
                connection.query(airCooledChillerQuery, [chiller1.id], (err, chillerChildren) => {
                    if (err) {
                        return done(err);
                    }

                    chillerChildren = chillerChildren.map(child => ({
                        ...child,
                        value: formatValue(child.param_value) // Format the param_value
                    }))
            
                    done(null, { ...chiller1, children: chillerChildren });
                });
            };
            const getdptChildren = (dpt, done) => {
                const dptChildren = `
                    SELECT DISTINCT gs.id, gs.name, gs.ss_type, gs.ss_address_value, gs.ss_parent, 
                                    gsle.param_id, gsle.param_value 
                    FROM gl_subsystem gs 
                    INNER JOIN gl_subsystem_latest_event gsle 
                    ON gs.ss_parent = gsle.ss_id 
                    WHERE gs.ss_parent = ? 
                    AND gs.name IN ('DPTn', 'DPTn_SP') 
                    AND gs.name = gsle.param_id 
                    ORDER BY gs.ss_address_value ASC 
                    LIMIT 10`;
            
                connection.query(dptChildren, [dpt.id], (err, chillerChildren) => {
                    if (err) {
                        return done(err);
                    }

                    chillerChildren = chillerChildren.map(child => ({
                        ...child,
                        value: formatValue(child.param_value) // Format the param_value
                    }))
            
                    done(null, { ...dpt, children: chillerChildren });
                });
            };
            
            

            const getChildren = (parent, done) => {
                const childrenQuery = `
                    SELECT id, name, description, ss_type 
                    FROM gl_subsystem 
                    WHERE ss_type='GL_SS_ADDRESS_BACNET_DDC' 
                    ORDER BY name ASC`;

                connection.query(childrenQuery, (childrenErr, childrenResults) => {
                    if (childrenErr) {
                        return done(childrenErr);
                    }

                    if (childrenResults.length === 0) {
                        results.push({ ...parent, children: [] });
                        return done();
                    }

                    let completedDdcQueries = 0;
                    const ddcList = [];

                    childrenResults.forEach(ddc => {
                        getDdcChildren(ddc, (err, ddcWithChildren) => {
                            if (err) {
                                return done(err);
                            }

                            ddcList.push(ddcWithChildren);
                            completedDdcQueries++;

                            if (completedDdcQueries === childrenResults.length) {
                                results.push({ ...parent, children: ddcList });
                                done();
                            }
                        });
                    });
                });
            };

            if (parentResults.length === 0) {
                connection.release();
                return callback(null, results);
            }

            let completedParentQueries = 0;

            parentResults.forEach(parent => {
                getChildren(parent, (err) => {
                    if (err) {
                        connection.release();
                        return callback(err);
                    }

                    completedParentQueries++;
                    if (completedParentQueries === parentResults.length) {
                        connection.release();
                        callback(null, results);
                    }
                });
            });
        });
    });
};

const formatValue = (value) => {
    const numberValue = parseFloat(value);
    if (!isNaN(numberValue)) {
        return numberValue.toFixed(2); 
    }
    return value; 
};

const checkalarms = (dev_id,callback)=>{
    pool.getConnection((err, connection) => {
        if (connection) {
            const sql ='select * from gl_alarm where restore=0 and delete_alarm=0 and ss_id=? group by param_id';
            connection.query(sql,dev_id ,(error, results) => {
            connection.release();
            // console.log("dev_iddddddddddddddddddd",dev_id)
            // console.log("check alarmsssssssssssssssss",results)
            if (error) {
              callback(error);
            } else {
              if (results.length === 0) {
                callback(null,[]);
              } else {
                callback(null, results);
              }
            }
          });
        } else {
          callback(err);
        }
    });
}

module.exports = {
    meetingRoomBooking,
    updateBooking,
    cancelBooking,
    floorList,
    hotDesking,
    configuration,
    meetingRoomList,
    hotDeskingList,
    bookedSeatList,
    getClientDetails,
    uploadCWSUsersData,
    bookedMeetingRoomList,
    getClientDetails,
    getFloorMapDetails,
    cwsUsers,
    deleteCwsUsers,
    getNetworkStatus,
    checkalarms
};
