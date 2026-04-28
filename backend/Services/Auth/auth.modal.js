const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const { pool } = require("../../Database/pool");
const { secret } = require("../../Config/common");
const logger = require("../../Config/logger");
const { result } = require("lodash");
const THIRTY_MIN = 120 * 60;
// const THIRTY_MIN = '365d';
const ONE_WEEK = 7 * 24 * 60 * 60;

const generateToken = (user) => {
  return jwt.sign(user, secret, {
    expiresIn: ONE_WEEK,
  });
};

const selfModeLogin = (user, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const loginQuery = `SELECT * FROM cws_users WHERE user_name = Binary ? and status=1`;
      connection.query(
        loginQuery,
        user.credentials.username,
        (error1, results1) => {
          if (error1) {
            connection.release();
            callback(error1);
          } else if (results1.length > 0) {
            var record;
            if (results1[0].role_id == 5) {
              record = {
                userId: results1[0].user_id,
                roleId: results1[0].role_id,
                roleName: results1[0].user_role,
                username: results1[0].user_name,
                campusId: results1[0].campus_id,
                buildingId: results1[0].building_id,
                lastLogin: results1[0].last_login,
              };
            }
            bcrypt.compare(
              user.credentials.password,
              results1[0].password,
              function(error1, matched) {
                if (error1) {
                  connection.release();
                  callback("Refresh and Try again");
                }
                if (!matched) {
                  connection.release();
                  logger.error(
                    "ACTION: User Login; RESULT: Invalid Credentials; USER: " +
                      record.username,
                  );
                  callback("Invalid credentials");
                } else {
                  const checkSession =
                    "select * from session where user_id = ?;";
                  connection.query(
                    checkSession,
                    results1[0].user_id,
                    (error2, result) => {
                      if (error2) {
                        connection.release();
                        callback("Refresh and Try again");
                      } else {
                        if (result.length === 0) {
                          const token = generateToken(record);
                          const upsertQuery =
                            "INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) " +
                            "ON DUPLICATE KEY UPDATE user_id = ?, token = ?";
                          const upsertQueryParams = [
                            uuid(),
                            results1[0].user_id,
                            token,
                            results1[0].user_id,
                            token,
                          ];
                          connection.query(
                            upsertQuery,
                            upsertQueryParams,
                            (error3, _results) => {
                              connection.release();
                              if (error3) {
                                callback("Refresh and Try again");
                              } else {
                                const lastLoginQuery =
                                  "UPDATE cws_users set last_login = ? where user_id = ?";
                                const lastLoginQueryParams = [
                                  new Date().toLocaleString(),
                                  results1[0].user_id,
                                ];
                                connection.query(
                                  lastLoginQuery,
                                  lastLoginQueryParams,
                                  (error4, _results1) => {
                                    if (error4) {
                                      callback(error4, "Refresh and Try again");
                                    } else {
                                      logger.info(
                                        "ACTION: User Login; RESULT: Success; ROLE: " +
                                          record.roleName +
                                          "; USER: " +
                                          record.username +
                                          "; USER ID: " +
                                          record.userId,
                                      );
                                      callback(null, {
                                        token,
                                        campusId: record.campusId,
                                        buildingId: record.buildingId,
                                        userId: record.userId,
                                        roleId: record.roleId,
                                        lastLogin: record.lastLogin,
                                      });
                                    }
                                  },
                                );
                              }
                            },
                          );
                        } else {
                          connection.release();
                          logger.error(
                            "ACTION: User Login; RESULT: User already Logged in; USER: " +
                              results1[0].user_id,
                          );
                          callback("User Already Logged In");
                        }
                      }
                    },
                  );
                }
              },
            );
            console.log("record: ", record);
          } else {
            callback(null, "Username doesn't exists !");
          }
        },
      );
    } else {
      callback("");
    }
  });
};
const login = (user, callback) => {
  if (!user.force) {
    pool.getConnection((err, connection) => {
      if (connection) {
        // const loginQuery = `SELECT * FROM user WHERE username = Binary ? and status=1`;
        const loginQuery = `SELECT u.*,b.name as building_name FROM user u,building b WHERE username = Binary ? and status=1 and u.building_id=b.id ;`;
        connection.query(
          loginQuery,
          user.credentials.username,
          (error, results) => {
            if (error) {
              connection.release();
              logger.error(`Error finding user while login: ${error.message}`);
              callback("Refresh and Try Again");
            }
            if (results.length !== 0) {
              var record;
              if (results[0].role_id == 5) {
                record = {
                  userId: results[0].id,
                  roleId: results[0].role_id,
                  roleName: results[0].role_name,
                  username: results[0].username,
                  campusId: results[0].campus_id,
                  lastLogin: results[0].last_login,
                };
              } else if (results[0].role_id >= 2) {
                record = {
                  userId: results[0].id,
                  roleId: results[0].role_id,
                  roleName: results[0].role_name,
                  campusId: results[0].campus_id,
                  username: results[0].username,
                  buildingId: results[0].building_id,
                  buildingName: results[0].building_name,
                  lastLogin: results[0].last_login,
                };
              }

              bcrypt.compare(
                user.credentials.password,
                results[0].password,
                function(error1, matched) {
                  if (error1) {
                    connection.release();
                    callback("Refresh and Try again");
                  }
                  if (!matched) {
                    connection.release();
                    logger.error(
                      "ACTION: User Login; RESULT: Invalid Credentials; USER: " +
                        record.username,
                    );
                    callback("Invalid credentials");
                  } else {
                    const checkSession =
                      "select * from session where user_id = ?;";
                    connection.query(
                      checkSession,
                      results[0].id,
                      (error2, result) => {
                        if (error2) {
                          connection.release();
                          callback("Refresh and Try again");
                        } else {
                          if (result.length === 0) {
                            console.log("194", record);
                            const token = generateToken(record);
                            const upsertQuery =
                              "INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) " +
                              "ON DUPLICATE KEY UPDATE user_id = ?, token = ?";
                            const upsertQueryParams = [
                              uuid(),
                              results[0].id,
                              token,
                              results[0].id,
                              token,
                            ];
                            connection.query(
                              upsertQuery,
                              upsertQueryParams,
                              (error3, _results) => {
                                if (error3) {
                                  callback(error3);
                                } else {
                                  const query =
                                    "INSERT into gl_user_session(user_id,token)values(?,?)";
                                  connection.query(
                                    query,
                                    [results[0].id, token],
                                    (error4, __results) => {
                                      connection.release();
                                      if (error4) {
                                        callback("Refresh and Try again");
                                      } else {
                                        const lastLoginQuery =
                                          "UPDATE user set last_login = ? where id = ?";
                                        const lastLoginQueryParams = [
                                          new Date().toLocaleString(),
                                          results[0].id,
                                        ];
                                        connection.query(
                                          lastLoginQuery,
                                          lastLoginQueryParams,
                                          (error4, _results1) => {
                                            if (error4) {
                                              callback(
                                                error4,
                                                "Refresh and Try again5",
                                              );
                                            } else {
                                              logger.info(
                                                "ACTION: User Login; RESULT: Success; ROLE: " +
                                                  record.roleName +
                                                  "; USER: " +
                                                  record.username +
                                                  "; USER ID: " +
                                                  record.userId,
                                              );
                                              const decoded = jwt.decode(token);
                                              console.log(
                                                "###############################",
                                                decoded,
                                              );
                                              callback(null, {
                                                token,
                                                campusId: record.campusId,
                                                buildingId: record.buildingId,
                                                buildingName:
                                                  record.buildingName,
                                                username: record.username,
                                                userId: record.userId,
                                                roleId: record.roleId,
                                                lastLogin: record.lastLogin,
                                                exp: decoded.exp,
                                              });
                                            }
                                          },
                                        );
                                      }
                                    },
                                  );
                                }
                              },
                            );
                          } else {
                            connection.release();
                            logger.error(
                              "ACTION: User Login; RESULT: User already Logged in; USER: " +
                                results[0].id,
                            );
                            callback("User Already Logged In");
                          }
                        }
                      },
                    );
                  }
                },
              );
            } else {
              connection.release();
              logger.error("ACTION: User Login; Result: Invalid User");
              callback("Invalid User");
            }
          },
        );
      } else {
        callback("DB connection error");
      }
    });
  } else {
    pool.getConnection((_err, connection) => {
      if (connection) {
        connection.query(
          // 'SELECT * FROM user WHERE username = ? and status=1',
          `SELECT u.*,b.name as building_name FROM user u,building b WHERE username = Binary ? and status=1 and u.building_id=b.id `,
          user.credentials.username,
          (_err1, results) => {
            if (_err1) {
              connection.release();
              logger.error(`Error finding user while login: ${error.message}`);
              callback("Refresh and Try Again");
            }
            if (results.length !== 0) {
              const record = {
                userId: results[0].id,
                roleId: results[0].role_id,
                roleName: results[0].role_name,
                username: results[0].username,
                campusId: results[0].campus_id,
                buildingId: results[0].building_id,
                buildingName: results[0].building_name,
                lastLogin: results[0].last_login,
              };
              bcrypt.compare(
                user.credentials.password,
                results[0].password,
                function(_err2, matched) {
                  if (_err2) {
                    connection.release();
                    callback("Refresh and Try again");
                  }
                  if (!matched) {
                    connection.release();
                    callback("Invalid credentials");
                  } else {
                    const checkSession =
                      "select * from session where user_id = ?";
                    connection.query(
                      checkSession,
                      results[0].id,
                      (_err3, result) => {
                        if (_err3) {
                          connection.release();
                          callback("Refresh and Try again");
                        } else {
                          connection.query(
                            "DELETE FROM session WHERE user_id = ?",
                            results[0].id,
                            (_err4, _result) => {
                              if (_err4) {
                                connection.release();
                                callback(_err4);
                              }
                              const token = generateToken(record);
                              const upsertQuery =
                                "INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) " +
                                "ON DUPLICATE KEY UPDATE user_id = ?, token = ?";
                              const upsertQueryParams = [
                                uuid(),
                                results[0].id,
                                token,
                                results[0].id,
                                token,
                              ];
                              connection.query(
                                upsertQuery,
                                upsertQueryParams,
                                (_err5, _results) => {
                                  connection.release();
                                  if (_err5) {
                                    callback("Refresh and Try again");
                                  } else {
                                    //  updateToken(results[0].id,token,(errToken,resToken)=>{
                                    //   if(errToken){
                                    //     callback('Refresh and Try agian')
                                    //   }else{
                                    const lastLoginQuery =
                                      "UPDATE user set last_login = ? where id = ?";
                                    const lastLoginQueryParams = [
                                      new Date().toLocaleString(),
                                      results[0].id,
                                    ];
                                    connection.query(
                                      lastLoginQuery,
                                      lastLoginQueryParams,
                                      (error4, _results1) => {
                                        if (error4) {
                                          callback(
                                            error4,
                                            "Refresh and Try again",
                                          );
                                        } else {
                                          logger.info(
                                            "ACTION: User Login; RESULT: Success; ROLE: " +
                                              record.roleName +
                                              "; USER: " +
                                              record.username +
                                              "; USER ID: " +
                                              record.userId,
                                          );
                                          const decoded = jwt.decode(token);
                                          callback(null, {
                                            token,
                                            campusId: record.campusId,
                                            buildingId: record.buildingId,
                                            buildingName: record.buildingName,
                                            userId: record.userId,
                                            username: record.username,
                                            roleId: record.roleId,
                                            lastLogin: record.lastLogin,
                                            exp: decoded.exp,
                                          });
                                        }
                                      },
                                    );
                                    //   }
                                    // })
                                  }
                                },
                              );
                            },
                          );
                        }
                      },
                    );
                  }
                },
              );
            } else {
              connection.release();
              callback("Invalid User");
            }
          },
        );
      } else {
        callback("DB connection error");
      }
    });
  }
};

const logout = (user, token, callback) => {
  pool.getConnection((err, connection) => {
    if (callback) {
      const query = "DELETE FROM session WHERE user_id = ? and token= ?";
      connection.query(query, [user.data.userId, token], (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, results);
          // userInfo(user.data.userId,(err,results)=>{
          //   if(err){
          //     callback(err)
          //   }else{
          //     const query2 = 'UPDATE gl_user_session SET token="Done" , is_active=0 WHERE id=?';
          //     connection.query(query2,[results[0].id],(error1,results1)=>{
          //       connection.release();
          //       if(error1){
          //         callback(error1)
          //       }
          //       logger.info("ACTION: User Logout; RESULT: Success; USER: "+user.data.username+"; USER ID: "+user.data.userId)
          //       callback(null, results1);
          //     })
          //   }
          // })
        }
      });
    } else {
      callback(err);
    }
  });
};

const secretKey = (userId, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const sqlQ = "select secret from user where id = ?";
      connection.query(sqlQ, userId, (err, res) => {
        connection.release();
        if (err) {
          callback("Empty");
        } else {
          if (res[0].secret === null) {
            callback(null, "failure");
          } else {
            callback(null, "success");
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
      const sqlQ =
        'select sa.mac_address,glc.gl_key,glc.gl_value from super_admin sa, gl_super_admin_configuration glc where glc.gl_key="licence_end_date" and glc.gl_value> NOW();';
      connection.query(sqlQ, (err, res) => {
        connection.release();
        if (err) {
          callback("Empty");
        } else {
          bcrypt.compare(mac, res[0].mac_address, function(error1, matched) {
            if (error1) {
              callback("Error comparing!!");
            } else if (!matched) {
              callback("Mac address didnt match!!");
            } else {
              callback(null, "matched");
            }
          });
        }
      });
    } else {
      callback(error);
    }
  });
};

const getUsers = (callback) => {
  let usersData = {};
  pool.getConnection((error, connection) => {
    if (connection) {
      const sqlQ = "select * from user where role_id!=1";
      connection.query(sqlQ, (err, results) => {
        if (err) {
          connection.release();
          callback("Empty");
        } else {
          usersData.users = results;
          const campusQ = "select id,name from campus";
          connection.query(campusQ, (_err, campuses) => {
            if (_err) {
              connection.release();
              callback("Empty");
            } else {
              usersData.campuses = campuses;
              console.log("usersData", usersData);
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
        "SELECT * FROM user WHERE username = Binary ? and role_id = 1";
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
              lastLogin: results[0].last_login,
            };
            bcrypt.compare(
              user.credentials.password,
              results[0].password,
              function(_error1, matched) {
                if (_error1) {
                  callback("Refresh and Try again");
                }
                if (!matched) {
                  connection.release();
                  logger.error(
                    "ACTION: Super Admin Login; RESULT: Invalid Credentials; USER: " +
                      record.username,
                  );
                  callback("Invalid credentials");
                } else {
                  const checkSession =
                    "select * from session where user_id = ?;";
                  connection.query(
                    checkSession,
                    results[0].id,
                    (_error2, result) => {
                      if (_error2) {
                        connection.release();
                        callback("Refresh and Try again");
                      } else {
                        if (result.length === 0) {
                          const token = generateToken(record);
                          const upsertQuery =
                            "INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) " +
                            "ON DUPLICATE KEY UPDATE user_id = ?, token = ?";
                          const upsertQueryParams = [
                            uuid(),
                            results[0].id,
                            token,
                            results[0].id,
                            token,
                          ];
                          connection.query(
                            upsertQuery,
                            upsertQueryParams,
                            (_error3, _results1) => {
                              if (_error3) {
                                callback(_error3);
                              }
                              {
                                const query =
                                  "INSERT into gl_user_session(user_id,token)values(?,?)";
                                connection.query(
                                  query,
                                  [results[0].id, token],
                                  (_error4, _results) => {
                                    connection.release();
                                    if (_error4) {
                                      callback("Refresh and Try again");
                                    } else {
                                      const lastLoginQuery =
                                        "UPDATE user set last_login = ? where id = ?";
                                      const lastLoginQueryParams = [
                                        new Date().toLocaleString(),
                                        results[0].id,
                                      ];
                                      connection.query(
                                        lastLoginQuery,
                                        lastLoginQueryParams,
                                        (error4, _results10) => {
                                          if (error4) {
                                            callback(
                                              error4,
                                              "Refresh and Try again",
                                            );
                                          } else {
                                            logger.info(
                                              "ACTION: User Login; RESULT: Success; ROLE: " +
                                                record.roleName +
                                                "; USER: " +
                                                record.username +
                                                "; USER ID: " +
                                                record.userId,
                                            );
                                            callback(null, {
                                              token,
                                              campusId: record.campusId,
                                              userId: record.userId,
                                              roleId: record.roleId,
                                              lastLogin: record.lastLogin,
                                            });
                                          }
                                        },
                                      );
                                    }
                                  },
                                );
                              }
                            },
                          );
                        } else {
                          connection.release();
                          logger.error("");
                          callback("User Already Logged In");
                        }
                      }
                    },
                  );
                }
              },
            );
          } else {
            connection.release();
            callback("Invalid User");
          }
        },
      );
    } else {
      callback("DB connection error");
    }
  });
};

const superAdminForceLogin = (user, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const superAdminForceLoginQuery =
        "SELECT * FROM user WHERE username = Binary ? and role_id = 1";
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
                    callback("Refresh and Try again");
                  }
                  if (!matched) callback("Password is wrong!");
                  else {
                    const record = {
                      userId: results[0].id,
                      roleId: results[0].role_id,
                      roleName: results[0].role_name,
                      username: results[0].username,
                      campusId: results[0].campus_id,
                      lastLogin: results[0].last_login,
                    };
                    const checkSession =
                      "select * from session where user_id = ?";
                    // 'select * from session where user_id = ? and created_at >= NOW() - INTERVAL 30 MINUTE;';
                    connection.query(
                      checkSession,
                      results[0].id,
                      (_error3, result) => {
                        if (_error3) {
                          connection.release();
                          callback("Refresh and Try again");
                        } else {
                          if (result.length > 0) {
                            connection.query(
                              "DELETE FROM session WHERE user_id = ?",
                              results[0].id,
                              (_error4, _result1) => {
                                if (_error4) {
                                  connection.release();
                                  callback(_error4);
                                } else if (_result1) {
                                  const token = generateToken(record);
                                  const upsertQuery =
                                    "INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) " +
                                    "ON DUPLICATE KEY UPDATE user_id = ?, token = ?";
                                  const upsertQueryParams = [
                                    uuid(),
                                    results[0].id,
                                    token,
                                    results[0].id,
                                    token,
                                  ];
                                  connection.query(
                                    upsertQuery,
                                    upsertQueryParams,
                                    (_error5, _results2) => {
                                      connection.release();
                                      if (_error5) {
                                        callback("Refresh and Try again");
                                      } else {
                                        const lastLoginQuery =
                                          "UPDATE user set last_login = ? where id = ?";
                                        const lastLoginQueryParams = [
                                          new Date().toLocaleString(),
                                          results[0].id,
                                        ];
                                        connection.query(
                                          lastLoginQuery,
                                          lastLoginQueryParams,
                                          (error4, _results1) => {
                                            if (error4) {
                                              callback(
                                                error4,
                                                "Refresh and Try again",
                                              );
                                            } else {
                                              logger.info(
                                                "ACTION: User Login; RESULT: Success; ROLE: " +
                                                  record.roleName +
                                                  "; USER: " +
                                                  record.username +
                                                  "; USER ID: " +
                                                  record.userId,
                                              );
                                              callback(null, {
                                                token,
                                                campusId: record.campusId,
                                                userId: record.userId,
                                                roleId: record.roleId,
                                                lastLogin: record.lastLogin,
                                              });
                                            }
                                          },
                                        );
                                      }
                                    },
                                  );
                                }
                              },
                            );
                            // callback('User Already Logged In');
                          } else {
                            const token = generateToken(record);
                            const upsertQuery =
                              "INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) " +
                              "ON DUPLICATE KEY UPDATE user_id = ?, token = ?";
                            const upsertQueryParams = [
                              uuid(),
                              results[0].id,
                              token,
                              results[0].id,
                              token,
                            ];
                            connection.query(
                              upsertQuery,
                              upsertQueryParams,
                              (_error6, _results3) => {
                                connection.release();
                                if (_error6) {
                                  callback("Refresh and Try again");
                                } else {
                                  callback(null, {
                                    token,
                                    campusId: record.campusId,
                                    userId: record.userId,
                                    roleId: record.roleId,
                                  });
                                }
                              },
                            );
                          }
                        }
                      },
                    );
                  }
                },
              );
            } else {
              callback("Invalid User");
            }
          }
        },
      );
    } else {
      callback("DB connection error");
    }
  });
};

const userForceLogin = (user, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      connection.query(
        "SELECT * FROM user WHERE username = ?",
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
                    callback("Refresh and Try again");
                  }
                  if (!matched) callback("Password is wrong!");
                  else {
                    const record = {
                      userId: results[0].id,
                      roleId: results[0].role_id,
                      roleName: results[0].role_name,
                      username: results[0].username,
                      campusId: results[0].campus_id,
                    };
                    const checkSession =
                      "select * from session where user_id = ?";
                    // 'select * from session where user_id = ? and created_at >= NOW() - INTERVAL 30 MINUTE;';
                    connection.query(
                      checkSession,
                      results[0].id,
                      (_error3, result) => {
                        if (_error3) {
                          connection.release();
                          callback("Refresh and Try again");
                        } else {
                          if (result.length > 0) {
                            connection.query(
                              "DELETE FROM session WHERE user_id = ?",
                              results[0].id,
                              (_error4, _result1) => {
                                if (_error4) {
                                  connection.release();
                                  callback(_error4);
                                } else if (_result1) {
                                  const token = generateToken(record);
                                  const upsertQuery =
                                    "INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) " +
                                    "ON DUPLICATE KEY UPDATE user_id = ?, token = ?";
                                  const upsertQueryParams = [
                                    uuid(),
                                    results[0].id,
                                    token,
                                    results[0].id,
                                    token,
                                  ];
                                  connection.query(
                                    upsertQuery,
                                    upsertQueryParams,
                                    (_error5, _results2) => {
                                      connection.release();
                                      if (_error5) {
                                        callback("Refresh and Try again");
                                      } else {
                                        callback(null, {
                                          token,
                                          campusId: record.campusId,
                                          userId: record.userId,
                                          roleId: record.roleId,
                                        });
                                      }
                                    },
                                  );
                                }
                              },
                            );
                            // callback('User Already Logged In');
                          } else {
                            const token = generateToken(record);
                            const upsertQuery =
                              "INSERT INTO session (id, user_id, token) VALUES (?, ?, ?) " +
                              "ON DUPLICATE KEY UPDATE user_id = ?, token = ?";
                            const upsertQueryParams = [
                              uuid(),
                              results[0].id,
                              token,
                              results[0].id,
                              token,
                            ];
                            connection.query(
                              upsertQuery,
                              upsertQueryParams,
                              (_error6, _results3) => {
                                connection.release();
                                if (_error6) {
                                  callback("Refresh and Try again");
                                } else {
                                  callback(null, {
                                    token,
                                    campusId: record.campusId,
                                    userId: record.userId,
                                    roleId: record.roleId,
                                  });
                                }
                              },
                            );
                          }
                        }
                      },
                    );
                  }
                },
              );
            } else {
              callback("Invalid User");
            }
          }
        },
      );
    } else {
      callback("DB connection error");
    }
  });
};

const createUser = (payload, callback) => {
  console.log("payload-----", payload);
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query("INSERT INTO user SET ?", payload, (error, results) => {
        connection.release();
        if (error) {
          console.log("error", error);
          callback(error);
        } else {
          logger.info(
            "ACTION: User Registration; USER NAME: " +
              payload.username +
              " USER ID: " +
              payload.id +
              "; USER ROLE: " +
              payload.role_name +
              "RESULT: Success; USER: admin; ROLE: user",
          );
          callback(null, results);
        }
      });
    } else {
      callback({ message: "DB connection error" });
    }
  });
};

const updateUser = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        "UPDATE user set username=?, campus_id=?, role_id=?, role_name=?, status=? where id=?",
        [
          payload.username,
          payload.campus_id,
          payload.role_id,
          payload.role_name,
          payload.status,
          payload.id,
        ],
        (error, results) => {
          connection.release();
          if (error) {
            logger.error(
              "ACTION: Update User; Result: Unable to update; USER ID: " +
                payload.id,
            );
            callback(error);
          } else {
            logger.info(
              "ACTION: Update User; RESULT: Success; USER ID: " + payload.id,
            );
            callback(null, results);
          }
        },
      );
    } else {
      callback({ message: "DB connection error" });
    }
  });
};

const deleteUser = (userId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        "DELETE FROM user where id = ?",
        userId,
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.affectedRows === 1) {
              logger.info(
                "ACTION: Delete User; RESULT: Success; USER ID: " + userId,
              );
              callback({ message: "User Deleted Successfully", status: 200 });
            } else {
              logger.error(
                "ACTION: Delete User; RESULT: User not found; USER ID: " +
                  userId,
              );
              callback({ message: "User Not Found", status: 404 });
            }
          }
        },
      );
    } else {
      callback(err);
    }
  });
};

const resetPassword = (user, passwordHash, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const sqlQ = "select password from user where id=? ";
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
                  callback("Refresh and Try again");
                }
                if (!matched) {
                  connection.release();
                  logger.error(
                    "ACTION: Reset Password; RESULT: Old Password is Invalid; USER ID: " +
                      user.id,
                  );
                  callback("Old password is not correct!");
                } else {
                  bcrypt.compare(
                    user.new_password,
                    res[0].password,
                    (_error2, _matched) => {
                      if (_error2) {
                        connection.release();
                        callback("Refresh and Try again");
                      }
                      if (_matched) {
                        connection.release();
                        logger.error(
                          "ACTION: Reset Password; USER ID: " +
                            user.id +
                            "; RESULT: Password entered is the same as the old password",
                        );
                        callback(
                          "New password is same as the old one. Please change!",
                          null,
                        );
                      } else {
                        const sql = "update user set password = ? where id = ?";
                        connection.query(
                          sql,
                          [passwordHash, user.id],
                          (_error3, results) => {
                            connection.release();
                            if (_error3) callback(_error3, null);
                            else {
                              logger.info(
                                "ACTION: Reset Password; USER ID: " +
                                  user.id +
                                  "; RESULT: Success",
                              );
                              callback(null, results);
                            }
                          },
                        );
                      }
                    },
                  );
                }
              },
            );
          } else {
            bcrypt.compare(
              user.new_password,
              res[0].password,
              (_error4, _matched1) => {
                if (_error4) {
                  connection.release();
                  callback("Refresh and Try again");
                }
                if (_matched1) {
                  connection.release();
                  logger.error(
                    "ACTION: Reset Password; RESULT:Password entered is the same as the old password; USER ID: " +
                      user.id,
                  );
                  callback(
                    "New password is same as the old one. Please change!",
                    null,
                  );
                } else {
                  const sql = "update user set password = ? where id = ?";
                  connection.query(
                    sql,
                    [passwordHash, user.id],
                    (_error5, results) => {
                      connection.release();
                      if (_error5) callback(_error5, null);
                      else {
                        logger.info(
                          "ACTION: Reset Password;RESULT: Success; USER ID: " +
                            user.id,
                        );
                        callback(null, results);
                      }
                    },
                  );
                }
              },
            );
          }
        }
      });
    } else {
      callback("DB connection error");
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
        "select * from user where id = ? and secret = ?",
        [userId, secret_key],
        (err, res) => {
          if (err) {
            connection.release();
            callback(null, "Empty");
          } else if (res.length > 0) {
            connection.release();
            callback(null, "Secret Key Exists");
          } else {
            const sqlQ = "update user set secret = ? where id = ?";
            connection.query(sqlQ, [secret_key, userId], (_err1, _res1) => {
              if (_err1) {
                connection.release();
                callback("Empty");
              } else {
                connection.release();
                callback(null, "success");
              }
            });
          }
        },
      );
    } else {
      callback(null, "DB connection error");
    }
  });
};

const resetForgottenPassword = (username, secret_key, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const sqlQ = "select * from user where username = Binary ?";
      console.log(sqlQ);
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
                    campusId: _res1[0].campus_id,
                  };
                  connection.release();
                  logger.info(
                    "ACTION: Forgot Password; RESULT: Successfully sent token; USER: " +
                      record.username +
                      "; USER ID: " +
                      record.userId,
                  );
                  callback(null, {
                    user_id: record.userId,
                    token: jwt.sign(record, secret, {
                      expiresIn: 10 * 60,
                    }),
                  });
                } else {
                  logger.error(
                    "ACTION: Forgot Password; RESULT: Invalid Secret key; USER: " +
                      username,
                  );
                  callback("Invalid Secret key");
                }
              }
            });
          } else {
            logger.error("Invalid User");
            callback("Invalid Username");
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
//       console.log(sqlQ);
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
//             console.log("else");
//             callback(err);
//           }
//         }
//       });
//     } else {
//       callback('DB connection error');
//     }
//   });
// };

const updateToken = (userId, token, callback) => {
  userInfo(userId, (err, res) => {
    if (err) {
      callback(err);
    } else {
      pool.getConnection((error, connection) => {
        if (connection) {
          const query = "update gl_user_session set token=? where id=?";
          connection.query(query, [token, res[0].id], (errup, resup) => {
            connection.release();
            if (errup) {
              callback(errup);
            } else {
              callback(null, resup);
            }
          });
        } else {
          callback("DB CONNECTION ERROR");
        }
      });
    }
  });
};

const userInfo = (user_id, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        "select token,is_active,id from gl_user_session where user_id=? AND is_active=1;";
      connection.query(query, [user_id], (err, results) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback("DB CONNECTION ERROR");
    }
  });
};

const setServerStatus = (param_value, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const selquery = `select id from gl_subsystem where ss_type='GL_SS_SERVER';`;
      connection.query(selquery, (err, results) => {
        if (err) {
          callback(err);
        } else {
          const upquery = `update gl_subsystem_detail set param_value=? where param_name='restart' and ss_id=?`;
          connection.query(
            upquery,
            [param_value, results[0].id],
            (err1, result1) => {
              connection.release();
              if (err1) {
                callback(err1);
              } else {
                callback(null, result1);
              }
            },
          );
        }
      });
    } else {
      callback("DB CONECTION ERROR");
    }
  });
};

const addLicenceDates = (data, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      let count = 0;
      for (var key in data) {
        // let dataa =[]
        var key = key;
        var value = data[key];
        // dataa.push(key)
        // dataa.push(value)
        console.log(key + "-->" + value);
        const query = "insert into gl_super_admin_configuration set ?";
        connection.query(query, { key, value }, (err, results) => {
          if (err) {
            callback(err);
          } else {
            count++;
            if (count == Object.keys(data).length) {
              connection.release();
              callback(null, "inserted");
            }
          }
        });
      }
    } else {
      callback("DB CONNECTION ERROR");
    }
  });
};

module.exports = {
  selfModeLogin,
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
  checkMacAddress,
  userInfo,
  setServerStatus,
  addLicenceDates,
};
