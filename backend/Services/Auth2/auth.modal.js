const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const { pool } = require('../../Database/pool');
const { secret } = require('../../Config/common');
const logger = require('../../Config/logger');
const glzoneModel=require('../Gl_zone/Gl_zone.model')
const { result } = require('lodash');
const THIRTY_MIN = 120 * 60;

const generateToken = user => {
  return jwt.sign(user, secret, {
    expiresIn: THIRTY_MIN
  });
};

const login = (user, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      console.log("user------",user)
      const loginQuery = `SELECT id,email_id FROM gl_user WHERE user_id = ? and password = ?`;
      connection.query(
        loginQuery,
        [user.credentials.username, user.credentials.password],
        (error, results) => {
          if (error) {
            connection.release();
            logger.error(`Error while login: ${error.message}`);
            console.log('Something went wrong', error);
            callback('Something went wrong');
          } else if (results.length == 0) {
            connection.release();
            logger.error(`Invalid Credentials`);
            console.log('Invalid Credentials here');
            callback('Invalid Credentials');
          } else {
            const token = generateToken({
              id: results[0].id,
              email: results[0].email_id
            });
            connection.query(
              'SELECT count(*) as count from gl_user_session where user_id = ?',
              results[0].id,
              (error2, countResult) => {
                if (countResult[0].count == 0) {
                  const insertToken =
                    'INSERT INTO gl_user_session(user_id, token) values(?,?)';
                  connection.query(
                    insertToken,
                    [results[0].id, token],
                    (error3, successfulInsertion) => {
                      if (error3) {
                        console.log('Error in inserting new token');
                      } else {
                        console.log('Token inserted');
                      }
                    }
                  );
                } else {
                  //callback('User Already Logged In');
                  connection.query(
                    'update gl_user_session set user_id = ?, token = ?',
                    [results[0].id, token],
                    (error4, successfulUpdate) => {
                      if (error4) {
                        console.log('Error in updating token');
                      } else {
                        console.log('Token updated');
                      }
                    }
                  );
                }
              }
            );
             const roleAccessQuery = `select ur.role_id, r.name as role_name, ra.access_id as access_id, a.access_name as access_name,zu.zone_id from gl_user_role ur inner join gl_role r on ur.role_id = r.id inner join gl_role_access ra on ur.role_id = ra.role_id inner join gl_access a on a.id = ra.access_id inner join GL_LOCATION_user zu on ur.user_id = zu.user_id where zu.user_id = ? and a.is_active = 1`;

            const getAccess = () => {
              return new Promise((resolve, reject) => {
                connection.query(
                  roleAccessQuery,
                  results[0].id,
                  (error2, results2) => {
                    if (error2) {
                      reject(error2);
                      return;
                    } else {
                      let accessList = new Set();
                      let zonesList = new Set();
                      results2.forEach(e => {
                        accessList.add(e.access_name);
                        zonesList.add(e.zone_id);
                      });
                      resolve([Array.from(accessList), Array.from(zonesList)]);
                    // let zones=Array.from(zonesList);
                    // let zone_list=[]
                    // zones.forEach((each,index)=>{
                    //   let resp={}
                    //   glzoneModel.getGlZone(each,(error,res)=>{
                    //     if(error){
                    //       reject("error")
                    //     }else{
                    //       resp= res.map(i=>{
                    //         zone_list.push(i)
                    //         return i
                    //       })
                    //       index++
                    //       if(zones.length==index){
                    //         resolve([Array.from(accessList),zone_list])
                    //       }
                    //     }
                    //   })
                    // })
                    }
                  }
                );
              });
            };
            getAccess()
              .then(obj => {
                let responseObj = {};
                responseObj.user = { id: results[0].id };
                responseObj.access = obj[0];
                responseObj.zones = obj[1];
                responseObj.building= {
                  id: obj[1]
                },
                responseObj.name = "Graylinx_Building";
                responseObj.token = 'JWT ' + token;
                connection.release();
                callback(null, responseObj);
              })
              .catch(error => console.log(error));
          }
        }
      );
    } else {
      console.log('DB connection error');
    }
  });
  // if (!user.credentials.f) {
  //   pool.getConnection((err, connection) => {
  //     if (connection) {
  //       const loginQuery = `SELECT * FROM gl_user WHERE name = Binary ?`;
  //       connection.query(loginQuery, user.credentials.username,
  //         (error, results) => {
  //           if (error) {
  //             connection.release();
  //             logger.error(`Error finding user while login: ${error.message}`);
  //             callback('Refresh and Try Again');
  //           }
  //           else if (results.length !== 0) {
  //             connection.query('select zu.zone_id, zu.usage_type, gu.user_role, gr.name as role_name from gl_zone_user zu inner join gl_user gu inner join gl_role gr where gu.id = zu.user_id and gu.user_role = gr.id and zu.user_id = ?',[results[0].id], (error, res) => {

  //             if(error) {
  //                 connection.release();
  //                 logger.error(`Error finding user while login: ${error.message}`);
  //                 callback('Refresh and Try Again');
  //               }
  //               if(res.length !==0) {
  //                 console.log("res==========", res)
  //                 var record;
  //                 record = {
  //                   userId: results[0].id,
  //                   roleId: res[0].user_role,
  //                   roleName: res[0].role_name,
  //                   gl_zone: res[0].usage_type,
  //                   gl_zone_id: res[0].zone_id
  //                   // lastLogin: results[0].last_login
  //                 };
  //                 bcrypt.compare(
  //                   user.credentials.password,
  //                   results[0].password,
  //                   function (error1, matched) {
  //                     if (error1) {
  //                       connection.release();
  //                       callback('Refresh and Try again');
  //                     }
  //                     if (!matched) {
  //                       connection.release();
  //                       logger.error("ACTION: User Login; RESULT: Invalid Credentials; USER: "+record.name)
  //                       callback('Invalid credentials');
  //                     }
  //                     else {
  //                       const checkSession =
  //                         'select * from gl_user_profile where param_name="session" AND user_id=?;';
  //                       connection.query(
  //                         checkSession,
  //                         results[0].id,
  //                         (error2, result) => {
  //                           if (error2) {
  //                             connection.release();
  //                             callback('Refresh and Try again and error at checking session');
  //                           } else {
  //                             if (result.length === 0) {
  //                               const token = generateToken(record);
  //                               const upsertQuery =
  //                                 'INSERT INTO gl_user_profile (id, user_id, param_name, param_value) VALUES (?, ?, "session", ?) ' +
  //                                 'ON DUPLICATE KEY UPDATE user_id = ?, param_value = ?';
  //                               const upsertQueryParams = [
  //                                 uuid(),
  //                                 results[0].id,
  //                                 token,
  //                                 results[0].id,
  //                                 token
  //                               ];
  //                               connection.query(
  //                                 upsertQuery,
  //                                 upsertQueryParams,
  //                                 (error3, _results) => {
  //                                   if (error3) {
  //                                     connection.release();
  //                                     callback('Refresh and Try again and error at inserting session');
  //                                   } else {
  //                                     const checkLastLogin = 'SELECT * from gl_user_profile where param_name="last_login" and user_id=?'
  //                                     connection.query(checkLastLogin, results[0].id, (error4, _results1) => {
  //                                       if (error4) {
  //                                         connection.release();
  //                                         callback('Refresh and Try again')
  //                                       } else {
  //                                         var updateLastLoginQuery, lastLoginQueryParams;
  //                                         if (_results1.length > 0) {
  //                                           updateLastLoginQuery = 'update gl_user_profile set param_value = ?' +
  //                                             'where param_name = "last_login"and user_id = ?';
  //                                           lastLoginQueryParams = [
  //                                             new Date().toLocaleString(),
  //                                             results[0].id
  //                                           ];
  //                                         }
  //                                         else {
  //                                           updateLastLoginQuery = 'INSERT INTO gl_user_profile (id, user_id, param_name, param_value) VALUES (?, ?, "last_login", ?) ' +
  //                                             'ON DUPLICATE KEY UPDATE user_id = ?, param_value = ?';
  //                                           lastLoginQueryParams = [
  //                                             uuid(),
  //                                             results[0].id,
  //                                             new Date().toLocaleString(),
  //                                             results[0].id,
  //                                             new Date().toLocaleString(),
  //                                           ];
  //                                         }

  //                                         connection.query(
  //                                           updateLastLoginQuery,
  //                                           lastLoginQueryParams,
  //                                           (error5, _results1) =>{
  //                                             if(error5) {
  //                                               callback(error4,'Refresh and Try again');
  //                                             } else {
  //                                               logger.info("ACTION: User Login; RESULT: Success; ROLE: "+record.roleName+
  //                                                 "; USER: "+record.username+"; USER ID: "+record.userId)
  //                                               callback(null, {
  //                                                 token,
  //                                                 glZone: record.gl_zone,
  //                                                 glZoneId: record.gl_zone_id,
  //                                                 userId: record.userId,
  //                                                 roleId: record.roleId,
  //                                                 roleName: record.roleName
  //                                                 //lastLogin: record.last_login
  //                                               });
  //                                             }
  //                                           }
  //                                         )
  //                                       }
  //                                     });
  //                                   }
  //                                 })
  //                             } else {
  //                               connection.release();
  //                               logger.error("ACTION: User Login; RESULT: User already Logged in; USER: "+results[0].id)
  //                               callback('User Already Logged In');
  //                             }
  //                           }
  //                         }
  //                       );
  //                     }
  //                   }
  //                 );
  //               } else {
  //                 connection.release();
  //                 logger.error("ACTION: User Login; Result: Invalid User")
  //                 callback('Invalid User');
  //               }
  //             })
  //           } else {
  //             connection.release();
  //             logger.error("ACTION: User Login; Result: Invalid User")
  //             callback('Invalid User');
  //           }
  //         }
  //       );
  //     } else {
  //       callback('DB connection error');
  //     }
  //   });
  // } else {
  //   pool.getConnection((err, connection) => {
  //     if (connection) {
  //       const loginQuery = `SELECT * FROM gl_user WHERE name = Binary ?`;
  //       connection.query(loginQuery, user.credentials.username,
  //         (error, results) => {
  //           if (error) {
  //             connection.release();
  //             logger.error(`Error finding user while login: ${error.message}`);
  //             callback('Refresh and Try Again');
  //           }
  //           else if (results.length !== 0) {
  //             connection.query('select zu.zone_id, zu.usage_type, gu.user_role, gr.name as role_name from gl_zone_user zu inner join gl_user gu inner join gl_role gr where gu.id = zu.user_id and gu.user_role = gr.id and zu.user_id = ?',[results[0].id], (error, res) => {

  //             if(error) {
  //                 connection.release();
  //                 logger.error(`Error finding user while login: ${error.message}`);
  //                 callback('Refresh and Try Again');
  //               }
  //               if(res.length !==0) {
  //                 console.log("res==========", res)
  //                 var record;
  //                 record = {
  //                   userId: results[0].id,
  //                   roleId: res[0].user_role,
  //                   roleName: res[0].role_name,
  //                   gl_zone: res[0].usage_type,
  //                   gl_zone_id: res[0].zone_id
  //                   // lastLogin: results[0].last_login
  //                 };
  //                 bcrypt.compare(
  //                   user.credentials.password,
  //                   results[0].password,
  //                   function (error1, matched) {
  //                     if (error1) {
  //                       connection.release();
  //                       callback('Refresh and Try again');
  //                     }
  //                     if (!matched) {
  //                       connection.release();
  //                       logger.error("ACTION: User Login; RESULT: Invalid Credentials; USER: "+record.name)
  //                       callback('Invalid credentials');
  //                     }
  //                     else {
  //                       const token = generateToken(record);
  //                       const updateSession =
  //                         'Update gl_user_profile set param_value = ? Where param_name = "session" and user_id = ?';
  //                       const upsertQueryParams = [
  //                         token,
  //                         results[0].id
  //                       ];
  //                       const updateLastLoginQuery = 'update gl_user_profile set param_value = ?' +
  //                         'where param_name = "last_login"and user_id = ?';
  //                       const lastLoginQueryParams = [
  //                         new Date().toLocaleString(),
  //                         results[0].id
  //                       ];
  //                       connection.query(
  //                         updateSession,
  //                         upsertQueryParams,
  //                         (error3, _results) => {
  //                           if (error3) {
  //                             console.log("error: ",error3)
  //                             connection.release();
  //                             callback('Refresh and Try again and error at inserting session');
  //                           } else {
  //                             connection.query(
  //                               updateLastLoginQuery,
  //                               lastLoginQueryParams,
  //                               (error4, _results1) => {
  //                                 if(_results1) {
  //                                   console.log("Updated session and last login")
  //                                   callback(null, {
  //                                     token,
  //                                     glZone: record.gl_zone,
  //                                     glZoneId: record.gl_zone_id,
  //                                     userId: record.userId,
  //                                     roleId: record.roleId,
  //                                     roleName: record.roleName
  //                                     //lastLogin: record.last_login
  //                                   });
  //                                 }
  //                               }
  //                             )
  //                           }
  //                         });
  //                     }
  //                   }
  //                 );
  //               } else {
  //                 connection.release();
  //                 logger.error("ACTION: User Login; Result: Invalid User")
  //                 callback('Invalid User');
  //               }
  //             })
  //           } else {
  //             connection.release();
  //             logger.error("ACTION: User Login; Result: Invalid User")
  //             callback('Invalid User');
  //           }
  //         }
  //       );
  //     } else {
  //       callback('DB connection error');
  //     }
  //   });
  // }
};

const logout = (user, token, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
      'DELETE FROM gl_user_session WHERE user_id = ? and token = ?';
      connection.query(
        query,
        [user.data.id,token],
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          }
          logger.info(
            'ACTION: User Logout; RESULT: Success; USER ID: ' + user.data.id
          );
          callback(null, 'success');
        }
      );
    } else {
      callback(err);
    }
  });
};

const secretKey = (userId, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const sqlQ = 'select secret from user where id = ?';
      connection.query(sqlQ, userId, (err, res) => {
        connection.release();
        if (err) {
          callback('Empty');
        } else {
          if (res[0].secret === null) {
            callback(null, 'failure');
          } else {
            callback(null, 'success');
          }
        }
      });
    } else {
      callback(error);
    }
  });
};

const checkMacAddress = (mac, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const sqlQ = 'select mac_address from super_admin';
      connection.query(sqlQ, (err, res) => {
        connection.release();
        if (err) {
          callback('Empty');
        } else {
          bcrypt.compare(mac, res[0].mac_address, function(error1, matched) {
            if (error1) {
              callback('Error comparing!!');
            } else if (!matched) {
              callback('Mac address didnt match!!');
            } else {
              callback(null, 'matched');
            }
          });
        }
      });
    } else {
      callback(error);
    }
  });
};

const getUsers = callback => {
  let usersData = {};
  pool.getConnection((error, connection) => {
    if (connection) {
      const sqlQ = 'select * from user where role_id!=1';
      connection.query(sqlQ, (err, results) => {
        if (err) {
          connection.release();
          callback('Empty');
        } else {
          usersData.users = results;
          const campusQ = 'select id,name from campus';
          connection.query(campusQ, (_err, campuses) => {
            if (_err) {
              connection.release();
              callback('Empty');
            } else {
              usersData.campuses = campuses;
              callback(null, usersData);
            }
          });
        }
      });
    } else {
      callback(error);
    }
  });
};

const superAdmin = (user, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const superAdminLogin =
        'SELECT * FROM user WHERE username = Binary ? and role_id = 1';
      connection.query(
        superAdminLogin,
        user.credentials.username,
        (_error, results) => {
          if (_error) {
            connection.release();
            callback(_error);
          }
          if (results.length !== 0) {
            const record = {
              userId: results[0].id,
              roleId: results[0].role_id,
              roleName: results[0].role_name,
              username: results[0].username,
              campusId: results[0].campus_id,
              lastLogin: results[0].last_login
            };
            bcrypt.compare(
              user.credentials.password,
              results[0].password,
              function(_error1, matched) {
                if (_error1) {
                  callback('Refresh and Try again');
                }
                if (!matched) {
                  connection.release();
                  logger.error(
                    'ACTION: Super Admin Login; RESULT: Invalid Credentials; USER: ' +
                      record.username
                  );
                  callback('Invalid credentials');
                } else {
                  const checkSession =
                    'select * from session where user_id = ?;';
                  connection.query(
                    checkSession,
                    results[0].id,
                    (_error2, result) => {
                      if (_error2) {
                        connection.release();
                        callback('Refresh and Try again');
                      } else {
                        if (result.length === 0) {
                          const token = generateToken(record);
                          const upsertQuery =
                            'INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) ' +
                            'ON DUPLICATE KEY UPDATE user_id = ?, token = ?';
                          const upsertQueryParams = [
                            uuid(),
                            results[0].id,
                            token,
                            results[0].id,
                            token
                          ];
                          connection.query(
                            upsertQuery,
                            upsertQueryParams,
                            (_error3, _results1) => {
                              connection.release();
                              if (_error3) {
                                callback('Refresh and Try again');
                              } else {
                                const lastLoginQuery =
                                  'UPDATE user set last_login = ? where id = ?';
                                const lastLoginQueryParams = [
                                  new Date().toLocaleString(),
                                  results[0].id
                                ];
                                connection.query(
                                  lastLoginQuery,
                                  lastLoginQueryParams,
                                  (error4, _results10) => {
                                    if (error4) {
                                      callback(error4, 'Refresh and Try again');
                                    } else {
                                      logger.info(
                                        'ACTION: User Login; RESULT: Success; ROLE: ' +
                                          record.roleName +
                                          '; USER: ' +
                                          record.username +
                                          '; USER ID: ' +
                                          record.userId
                                      );
                                      callback(null, {
                                        token,
                                        campusId: record.campusId,
                                        userId: record.userId,
                                        roleId: record.roleId,
                                        lastLogin: record.lastLogin
                                      });
                                    }
                                  }
                                );
                              }
                            }
                          );
                        } else {
                          connection.release();
                          logger.error('');
                          callback('User Already Logged In');
                        }
                      }
                    }
                  );
                }
              }
            );
          } else {
            connection.release();
            callback('Invalid User');
          }
        }
      );
    } else {
      callback('DB connection error');
    }
  });
};

const superAdminForceLogin = (user, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const superAdminForceLoginQuery =
        'SELECT * FROM user WHERE username = Binary ? and role_id = 1';
      connection.query(
        superAdminForceLoginQuery,
        user.credentials.username,
        (_error1, results) => {
          if (_error1) {
            connection.release();
            callback(_error1);
          } else {
            if (results.length !== 0) {
              bcrypt.compare(
                user.credentials.password,
                results[0].password,
                function(_error2, matched) {
                  if (_error2) {
                    callback('Refresh and Try again');
                  }
                  if (!matched) callback('Password is wrong!');
                  else {
                    const record = {
                      userId: results[0].id,
                      roleId: results[0].role_id,
                      roleName: results[0].role_name,
                      username: results[0].username,
                      campusId: results[0].campus_id,
                      lastLogin: results[0].last_login
                    };
                    const checkSession =
                      'select * from session where user_id = ?';
                    // 'select * from session where user_id = ? and created_at >= NOW() - INTERVAL 30 MINUTE;';
                    connection.query(
                      checkSession,
                      results[0].id,
                      (_error3, result) => {
                        if (_error3) {
                          connection.release();
                          callback('Refresh and Try again');
                        } else {
                          if (result.length > 0) {
                            connection.query(
                              'DELETE FROM session WHERE user_id = ?',
                              results[0].id,
                              (_error4, _result1) => {
                                if (_error4) {
                                  connection.release();
                                  callback(_error4);
                                } else if (_result1) {
                                  const token = generateToken(record);
                                  const upsertQuery =
                                    'INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) ' +
                                    'ON DUPLICATE KEY UPDATE user_id = ?, token = ?';
                                  const upsertQueryParams = [
                                    uuid(),
                                    results[0].id,
                                    token,
                                    results[0].id,
                                    token
                                  ];
                                  connection.query(
                                    upsertQuery,
                                    upsertQueryParams,
                                    (_error5, _results2) => {
                                      connection.release();
                                      if (_error5) {
                                        callback('Refresh and Try again');
                                      } else {
                                        const lastLoginQuery =
                                          'UPDATE user set last_login = ? where id = ?';
                                        const lastLoginQueryParams = [
                                          new Date().toLocaleString(),
                                          results[0].id
                                        ];
                                        connection.query(
                                          lastLoginQuery,
                                          lastLoginQueryParams,
                                          (error4, _results1) => {
                                            if (error4) {
                                              callback(
                                                error4,
                                                'Refresh and Try again'
                                              );
                                            } else {
                                              logger.info(
                                                'ACTION: User Login; RESULT: Success; ROLE: ' +
                                                  record.roleName +
                                                  '; USER: ' +
                                                  record.username +
                                                  '; USER ID: ' +
                                                  record.userId
                                              );
                                              callback(null, {
                                                token,
                                                campusId: record.campusId,
                                                userId: record.userId,
                                                roleId: record.roleId,
                                                lastLogin: record.lastLogin
                                              });
                                            }
                                          }
                                        );
                                      }
                                    }
                                  );
                                }
                              }
                            );
                            // callback('User Already Logged In');
                          } else {
                            const token = generateToken(record);
                            const upsertQuery =
                              'INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) ' +
                              'ON DUPLICATE KEY UPDATE user_id = ?, token = ?';
                            const upsertQueryParams = [
                              uuid(),
                              results[0].id,
                              token,
                              results[0].id,
                              token
                            ];
                            connection.query(
                              upsertQuery,
                              upsertQueryParams,
                              (_error6, _results3) => {
                                connection.release();
                                if (_error6) {
                                  callback('Refresh and Try again');
                                } else {
                                  callback(null, {
                                    token,
                                    campusId: record.campusId,
                                    userId: record.userId,
                                    roleId: record.roleId
                                  });
                                }
                              }
                            );
                          }
                        }
                      }
                    );
                  }
                }
              );
            } else {
              callback('Invalid User');
            }
          }
        }
      );
    } else {
      callback('DB connection error');
    }
  });
};

const userForceLogin = (user, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      connection.query(
        'SELECT * FROM user WHERE username = ?',
        user.credentials.username,
        (_error1, results) => {
          if (_error1) {
            connection.release();
            callback(_error1);
          } else {
            if (results.length !== 0) {
              bcrypt.compare(
                user.credentials.password,
                results[0].password,
                function(_error2, matched) {
                  if (_error2) {
                    callback('Refresh and Try again');
                  }
                  if (!matched) callback('Password is wrong!');
                  else {
                    const record = {
                      userId: results[0].id,
                      roleId: results[0].role_id,
                      roleName: results[0].role_name,
                      username: results[0].username,
                      campusId: results[0].campus_id
                    };
                    const checkSession =
                      'select * from session where user_id = ?';
                    // 'select * from session where user_id = ? and created_at >= NOW() - INTERVAL 30 MINUTE;';
                    connection.query(
                      checkSession,
                      results[0].id,
                      (_error3, result) => {
                        if (_error3) {
                          connection.release();
                          callback('Refresh and Try again');
                        } else {
                          if (result.length > 0) {
                            connection.query(
                              'DELETE FROM session WHERE user_id = ?',
                              results[0].id,
                              (_error4, _result1) => {
                                if (_error4) {
                                  connection.release();
                                  callback(_error4);
                                } else if (_result1) {
                                  const token = generateToken(record);
                                  const upsertQuery =
                                    'INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) ' +
                                    'ON DUPLICATE KEY UPDATE user_id = ?, token = ?';
                                  const upsertQueryParams = [
                                    uuid(),
                                    results[0].id,
                                    token,
                                    results[0].id,
                                    token
                                  ];
                                  connection.query(
                                    upsertQuery,
                                    upsertQueryParams,
                                    (_error5, _results2) => {
                                      connection.release();
                                      if (_error5) {
                                        callback('Refresh and Try again');
                                      } else {
                                        callback(null, {
                                          token,
                                          campusId: record.campusId,
                                          userId: record.userId,
                                          roleId: record.roleId
                                        });
                                      }
                                    }
                                  );
                                }
                              }
                            );
                            // callback('User Already Logged In');
                          } else {
                            const token = generateToken(record);
                            const upsertQuery =
                              'INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) ' +
                              'ON DUPLICATE KEY UPDATE user_id = ?, token = ?';
                            const upsertQueryParams = [
                              uuid(),
                              results[0].id,
                              token,
                              results[0].id,
                              token
                            ];
                            connection.query(
                              upsertQuery,
                              upsertQueryParams,
                              (_error6, _results3) => {
                                connection.release();
                                if (_error6) {
                                  callback('Refresh and Try again');
                                } else {
                                  callback(null, {
                                    token,
                                    campusId: record.campusId,
                                    userId: record.userId,
                                    roleId: record.roleId
                                  });
                                }
                              }
                            );
                          }
                        }
                      }
                    );
                  }
                }
              );
            } else {
              callback('Invalid User');
            }
          }
        }
      );
    } else {
      callback('DB connection error');
    }
  });
};

const createUser = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query('INSERT INTO user SET ?', payload, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          logger.info(
            'ACTION: User Registration; USER NAME: ' +
              payload.username +
              ' USER ID: ' +
              payload.id +
              '; USER ROLE: ' +
              payload.role_name +
              'RESULT: Success; USER: admin; ROLE: user'
          );
          callback(null, results);
        }
      });
    } else {
      callback({ message: 'DB connection error' });
    }
  });
};

const updateUser = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'UPDATE user set username=?, campus_id=?, role_id=?, role_name=?, status=? where id=?',
        [
          payload.username,
          payload.campus_id,
          payload.role_id,
          payload.role_name,
          payload.status,
          payload.id
        ],
        (error, results) => {
          connection.release();
          if (error) {
            logger.error(
              'ACTION: Update User; Result: Unable to update; USER ID: ' +
                payload.id
            );
            callback(error);
          } else {
            logger.info(
              'ACTION: Update User; RESULT: Success; USER ID: ' + payload.id
            );
            callback(null, results);
          }
        }
      );
    } else {
      callback({ message: 'DB connection error' });
    }
  });
};

const deleteUser = (userId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'DELETE FROM user where id = ?',
        userId,
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.affectedRows === 1) {
              logger.info(
                'ACTION: Delete User; RESULT: Success; USER ID: ' + userId
              );
              callback({ message: 'User Deleted Successfully', status: 200 });
            } else {
              logger.error(
                'ACTION: Delete User; RESULT: User not found; USER ID: ' +
                  userId
              );
              callback({ message: 'User Not Found', status: 404 });
            }
          }
        }
      );
    } else {
      callback(err);
    }
  });
};

const resetPassword = (user, passwordHash, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const sqlQ = 'select password from user where id=? ';
      connection.query(sqlQ, user.id, (err, res) => {
        if (err) {
          connection.release();
          callback(error);
        } else {
          if (user.reset) {
            bcrypt.compare(
              user.old_password,
              res[0].password,
              (_error1, matched) => {
                if (_error1) {
                  connection.release();
                  callback('Refresh and Try again');
                }
                if (!matched) {
                  connection.release();
                  logger.error(
                    'ACTION: Reset Password; RESULT: Old Password is Invalid; USER ID: ' +
                      user.id
                  );
                  callback('Old password is not correct!');
                } else {
                  bcrypt.compare(
                    user.new_password,
                    res[0].password,
                    (_error2, _matched) => {
                      if (_error2) {
                        connection.release();
                        callback('Refresh and Try again');
                      }
                      if (_matched) {
                        connection.release();
                        logger.error(
                          'ACTION: Reset Password; USER ID: ' +
                            user.id +
                            '; RESULT: Password entered is the same as the old password'
                        );
                        callback(
                          'New password is same as the old one. Please change!',
                          null
                        );
                      } else {
                        const sql = 'update user set password = ? where id = ?';
                        connection.query(
                          sql,
                          [passwordHash, user.id],
                          (_error3, results) => {
                            connection.release();
                            if (_error3) callback(_error3, null);
                            else {
                              logger.info(
                                'ACTION: Reset Password; USER ID: ' +
                                  user.id +
                                  '; RESULT: Success'
                              );
                              callback(null, results);
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          } else {
            bcrypt.compare(
              user.new_password,
              res[0].password,
              (_error4, _matched1) => {
                if (_error4) {
                  connection.release();
                  callback('Refresh and Try again');
                }
                if (_matched1) {
                  connection.release();
                  logger.error(
                    'ACTION: Reset Password; RESULT:Password entered is the same as the old password; USER ID: ' +
                      user.id
                  );
                  callback(
                    'New password is same as the old one. Please change!',
                    null
                  );
                } else {
                  const sql = 'update user set password = ? where id = ?';
                  connection.query(
                    sql,
                    [passwordHash, user.id],
                    (_error5, results) => {
                      connection.release();
                      if (_error5) callback(_error5, null);
                      else {
                        logger.info(
                          'ACTION: Reset Password;RESULT: Success; USER ID: ' +
                            user.id
                        );
                        callback(null, results);
                      }
                    }
                  );
                }
              }
            );
          }
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

// const resetForgotPassword = (user, passwordHash, callback) => {
//   pool.getConnection((error, connection) => {
//     if (connection) {
//       const sqlQ = 'select password from user where id=? ';
//       connection.query(sqlQ, user.id, (err, res) => {
//         if (err) {
//           callback(error);
//         } else {
//           if (user.reset) {
//             bcrypt.compare(
//               user.old_password,
//               res[0].password,
//               (error, matched) => {
//                 if (error) callback('Refresh and Try again');
//                 if (!matched) callback('Invalid Credentials');
//                 else {
//                   pool.getConnection((error, connection) => {
//                     if (connection) {
//                       const sql = 'update user set password = ? where id = ?';
//                       connection.query(
//                         sql,
//                         [passwordHash, user.id],
//                         (error, results) => {
//                           connection.release();
//                           if (error) callback(error);
//                           callback(null, results);
//                         }
//                       );
//                     } else {
//                       callback('DB connection error');
//                     }
//                   });
//                 }
//               }
//             );
//           } else {
//             pool.getConnection((error, connection) => {
//               if (connection) {
//                 const sql = 'update user set password = ? where id = ?';
//                 connection.query(
//                   sql,
//                   [passwordHash, user.id],
//                   (error, results) => {
//                     connection.release();
//                     if (error) callback(error);
//                     callback(null, results);
//                   }
//                 );
//               } else {
//                 callback('DB connection error');
//               }
//             });
//           }
//         }
//       });
//     } else {
//       callback('DB connection error');
//     }
//   });
// };

const updateSecretKey = (userId, secret_key, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      connection.query(
        'select * from user where id = ? and secret = ?',
        [userId, secret_key],
        (err, res) => {
          if (err) {
            connection.release();
            callback(null, 'Empty');
          } else if (res.length > 0) {
            connection.release();
            callback(null, 'Secret Key Exists');
          } else {
            const sqlQ = 'update user set secret = ? where id = ?';
            connection.query(sqlQ, [secret_key, userId], (_err1, _res1) => {
              if (_err1) {
                connection.release();
                callback('Empty');
              } else {
                connection.release();
                callback(null, 'success');
              }
            });
          }
        }
      );
    } else {
      callback(null, 'DB connection error');
    }
  });
};

const resetForgottenPassword = (username, secret_key, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const sqlQ = 'select * from user where username = Binary ?';
      connection.query(sqlQ, username, (err, res) => {
        if (err) {
          connection.release();
          callback(null, err);
        } else {
          if (res.length > 0) {
            const sqlQ1 = `select * from user where secret = ? and username = Binary ?`;
            connection.query(sqlQ1, [secret_key, username], (_err1, _res1) => {
              if (_err1) {
                connection.release();
                callback(null, _err1);
              } else {
                if (_res1.length > 0) {
                  const record = {
                    userId: _res1[0].id,
                    roleId: _res1[0].role_id,
                    roleName: _res1[0].role_name,
                    username: _res1[0].username,
                    campusId: _res1[0].campus_id
                  };
                  connection.release();
                  logger.info(
                    'ACTION: Forgot Password; RESULT: Successfully sent token; USER: ' +
                      record.username +
                      '; USER ID: ' +
                      record.userId
                  );
                  callback(null, {
                    user_id: record.userId,
                    token: jwt.sign(record, secret, {
                      expiresIn: 10 * 60
                    })
                  });
                } else {
                  logger.error(
                    'ACTION: Forgot Password; RESULT: Invalid Secret key; USER: ' +
                      username
                  );
                  callback('Invalid Secret key');
                }
              }
            });
          } else {
            logger.error('Invalid User');
            callback('Invalid Username');
          }
        }
      });
    }
  });
};

// const resetForgottenPassword = (username, secretKey, callback) => {
//   pool.getConnection((error, connection) => {
//     if (connection) {
//       const sqlQ = `select * from user where username = Binary '${username}' and secret = ?`;
//       connection.query(sqlQ, [secretKey], (err, res) => {
//         if (err) {
//           connection.release();
//           callback(null, err);
//         } else {
//           if (res.length > 0) {
//             const record = {
//               userId: res[0].id,
//               roleId: res[0].role_id,
//               roleName: res[0].role_name,
//               username: res[0].username,
//               campusId: res[0].campus_id
//             };
//             connection.release();
//             callback(null, {
//               user_id: record.userId,
//               token: jwt.sign(record, secret, {
//                 expiresIn: 10 * 60
//               })
//             });
//           } else {
//             callback(err);
//           }
//         }
//       });
//     } else {
//       callback('DB connection error');
//     }
//   });
// };

module.exports = {
  login,
  logout,
  secretKey,
  createUser,
  updateUser,
  getUsers,
  deleteUser,
  superAdmin,
  superAdminForceLogin,
  userForceLogin,
  resetPassword,
  // resetForgotPassword,
  updateSecretKey,
  resetForgottenPassword,
  checkMacAddress
};
