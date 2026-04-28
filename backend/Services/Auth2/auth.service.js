const bcrypt = require('bcryptjs');
const model = require('./auth.modal');
const uuid = require('uuid/v4');
const { use } = require('./auth.route');

const SALT_FACTOR = 10;

const hash = (text, callback) => {
  bcrypt.genSalt(SALT_FACTOR, function(error, salt) {
    if (error) callback(error);
    bcrypt.hash(text, salt, function(_error, hash1) {
      if (_error) {
        callback(_error);
      } else {
        callback(null, hash1);
      }
    });
  });
};

const login = (user, callback) => {
  model.login(user, (error, result) => {
    if (error) {
      console.log('error in service');
      callback(error);
    } else {
      console.log('response in service: ', result);
      callback(null, result);
    }
  });
};

const logout = (user, jwt, callback) => {
  model.logout(user, jwt, (error, response) => {
    if (error) {
      callback(error);
    } else {
      callback(null, response);
    }
  });
};

const secretKey = (userId, callback) => {
  model.secretKey(userId, (error, response) => {
    if (error) {
      callback(error);
    } else {
      callback(null, response);
    }
  });
};

const superAdmin = (user, callback) => {
  model.superAdmin(user, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, {
        token: 'JWT ' + result.token,
        lastLogin: result.lastLogin,
        userId: result.userId
      });
    }
  });
};

const superAdminForceLogin = (user, callback) => {
  model.superAdminForceLogin(user, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, {
        token: 'JWT ' + result.token,
        lastLogin: result.lastLogin,
        userId: result.userId
      });
    }
  });
};

const userForceLogin = (user, callback) => {
  model.userForceLogin(user, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, {
        token: 'JWT ' + result.token,
        campus: {
          id: result.campusId
        },
        user: {
          id: result.userId
        },
        role: {
          id: result.roleId
        }
      });
    }
  });
};

const registerUser = (user, callback) => {
  hash(user.password, (error, passwordHash) => {
    if (error) {
      callback({ message: 'User Registration failed' });
    } else {
      const role_id = Object.freeze({
        superAdmin: 1,
        admin: 2,
        user: 3,
        cluster_manager: 4,
        hq_manager: 5
      });
      const payload = {
        id: uuid(),
        username: user.username,
        password: passwordHash,
        secret: null,
        role_name: user.roleName,
        campus_id: user.campus.id,
        building_id: user.building_id ? user.building_id : null,
        role_id: role_id[user.roleName]
      };
      model.createUser(payload, _error => {
        if (_error) {
          if (_error.code === 'ER_DUP_ENTRY')
            callback('Username Already Exists');
          else callback('User Registration failed / Invalid Campus ID');
        } else {
          callback(null);
        }
      });
    }
  });
};

const updateUser = (user, callback) => {
  // hash(user.password, (error, passwordHash) => {
  //   if (error) {
  //     callback({message: 'User Registration failed'});
  //   } else {
  const role_id = Object.freeze({
    superAdmin: 1,
    admin: 2,
    user: 3,
    cluster_manager: 4,
    hq_manager: 5
  });
  const payload = {
    id: user.id,
    username: user.username,
    // password: passwordHash,
    role_name: user.roleName,
    campus_id: user.campus.id,
    role_id: role_id[user.roleName],
    status: user.status
  };
  model.updateUser(payload, error => {
    if (error) {
      callback('User update failed / Invalid Campus ID');
    } else {
      callback(null);
    }
  });
  // }
  // });
};
const deleteUser = (userId, callback) => {
  model.deleteUser(userId, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const getUsers = callback => {
  model.getUsers((error, response) => {
    if (error) {
      callback(error);
    } else {
      callback(null, response);
    }
  });
};

const resetPassword = (user, callback) => {
  hash(user.new_password, (error, passwordHash) => {
    if (error) {
      callback(error);
    } else {
      model.resetPassword(user, passwordHash, (err, response) => {
        if (err) {
          callback(err);
        } else {
          callback(null, response);
        }
      });
    }
  });
};

const updateSecretKey = (userId, secret, callback) => {
  model.updateSecretKey(userId, secret, (error, response) => {
    if (error) {
      callback(error);
    } else {
      callback(null, response);
    }
  });
};

const resetForgottenPassword = (username, secret, callback) => {
  model.resetForgottenPassword(username, secret, (error, response) => {
    if (error) {
      callback(error);
    } else {
      callback(null, response);
    }
  });
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
