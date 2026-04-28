const { CREATED, OK, NO_CONTENT } = require('http-status');
const { validationResult } = require('express-validator');
const service = require('./auth.service');

const moment = require('moment');
const lockout = {};

const login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const user = req.body;
    service.login(user, (error, response) => {
      if (error) {
        res.status(500).json({ errors: { global: error } });
      } else {
        res.status(OK).json(response);
        //console.log('response in controller');
      }
    });
  }
};

// const login = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(422).json({ errors: errors.array() });
//   } else {
//     const user = req.body;
//     service.login(user, (error, response) => {
//       if (error) {
//         res.status(400).json({ errors: { global: error } });
//       } else {
//         res.status(CREATED).json(response);
//       }
//     });
//   }
// };

const logout = (req, res, next) => {
  const user = req.body;
  const jwt = req.headers.authorization.split(' ')[1] || null;
  service.logout(user, jwt, error => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(NO_CONTENT);
    }
  });
};

const secretKey = (req, res, next) => {
  const userId = req.params.id;
  service.secretKey(userId, (error, resp) => {
    if (error) {
      res.status(404).json({ error: error });
    } else {
      res.status(OK).json({ message: resp });
    }
  });
};

const getUsers = (req, res, next) => {
  service.getUsers((error, resp) => {
    if (error) {
      res.status(404).json({ error: error });
    } else {
      res.status(OK).json(resp);
    }
  });
};

const superAdmin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const user = req.body;
    if (
      lockout.hasOwnProperty(`${user.credentials.username}`) &&
      lockout[`${user.credentials.username}`].hasOwnProperty('isLocked') &&
      lockout[`${user.credentials.username}`].isLocked &&
      lockout[`${user.credentials.username}`].hasOwnProperty('expiresIn') &&
      moment(lockout[`${user.credentials.username}`].expiresIn).isSameOrAfter(
        moment().format('YYYY-MM-DDTHH:mm:ss')
      )
    ) {
      res
        .status(400)
        .json({ errors: { global: 'Account Locked for 15 mins' } });
    } else {
      service.superAdmin(user, (error, response) => {
        if (error) {
          if (error === 'Invalid credentials') {
            if (
              lockout.hasOwnProperty(`${user.credentials.username}`) &&
              lockout[`${user.credentials.username}`].hasOwnProperty('count') &&
              lockout[`${user.credentials.username}`].hasOwnProperty('isLocked')
            ) {
              lockout[`${user.credentials.username}`] = {};
            } else if (
              lockout.hasOwnProperty(`${user.credentials.username}`) &&
              lockout[`${user.credentials.username}`].hasOwnProperty('count')
            ) {
              lockout[`${user.credentials.username}`].count++;
              if (lockout[`${user.credentials.username}`].count === 5) {
                lockout[`${user.credentials.username}`].isLocked = true;
                lockout[`${user.credentials.username}`].expiresIn = moment()
                  .add(15, 'm')
                  .format('YYYY-MM-DDTHH:mm:ss');
              }
            } else {
              lockout[`${user.credentials.username}`] = {
                count: 1
              };
            }
          }
          res.status(400).json({ errors: { global: error } });
        } else {
          lockout[`${user.credentials.username}`] = {};
          res.status(CREATED).json(response);
        }
      });
    }
  }
};

const superAdminForceLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const user = req.body;
    service.superAdminForceLogin(user, (error, response) => {
      if (error) {
        res.status(400).json({ errors: { global: error } });
      } else {
        res.status(CREATED).json(response);
      }
    });
  }
};

const userForceLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const user = req.body;
    service.userForceLogin(user, (error, response) => {
      if (error) {
        res.status(400).json({ errors: { global: error } });
      } else {
        res.status(CREATED).json(response);
      }
    });
  }
};

// const superAdmin = (req, res, next) => {
//   const user = req.body;
//   service.superAdmin(user, (error, result) => {
//     if (error) {
//       res.status(400).json({ errors: { global: 'invalid credentials' } });
//     } else {
//       res.status(CREATED).json(result);
//     }
//   });
// };

const registerUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const user = req.body;
    service.registerUser(user, error => {
      if (error) {
        // next(error);
        res.status(500).json({ error: error });
      } else {
        res.sendStatus(CREATED);
      }
    });
  }
};

const updateUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const user = req.body;
    service.updateUser(user, error => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(CREATED);
      }
    });
  }
};

const deleteUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const userId = req.body.id;
    service.deleteUser(userId, error => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json({ message: 'Success' });
      }
    });
  }
};

const resetPassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const user = req.body;
    service.resetPassword(user, (error, resp) => {
      if (error) {
        res.status(201).json({ error: error });
      } else {
        res.status(200).json({ message: resp });
      }
    });
  }
};

// const resetForgotPassword = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(422).json({ errors: errors.array() });
//   } else {
//     const user = req.body;
//     service.resetForgotPassword(user, (error,resp) => {
//       if (error) {
//         res.status(200).json({ error: error });
//       } else {
//         res.status(200).json({ message: resp});
//       }
//     });
//   }
// };

const updateSecretKey = (req, res, next) => {
  const userId = req.params.id;
  const secret = req.body.secret;
  service.updateSecretKey(userId, secret, (error, resp) => {
    if (error) {
      res.status(404).json({ error: error });
    } else {
      res.status(200).json({ message: resp });
    }
  });
};

const resetForgottenPassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const username = req.body.username;
    const secret = req.body.key;
    service.resetForgottenPassword(username, secret, (error, resp) => {
      if (error) {
        res.status(422).json({ error });
      } else {
        res.status(200).json(resp);
      }
    });
  }
};

module.exports = {
  login,
  logout,
  secretKey,
  superAdmin,
  superAdminForceLogin,
  userForceLogin,
  registerUser,
  updateUser,
  deleteUser,
  getUsers,
  resetPassword,
  // resetForgotPassword,
  updateSecretKey,
  resetForgottenPassword
};
