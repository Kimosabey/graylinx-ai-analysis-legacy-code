const passportJwt = require('passport-jwt');
const passport = require('passport');
const { pool } = require('../Database/pool')
const { secret } = require('../Config/common');

const Strategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(
  new Strategy(
    {
      secretOrKey: secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    async (token, done) => {
      try {
        return done(null, token);
      } catch (error) {
        done(error);
      }
    }
  )
);

const authenticate = passport.authenticate('jwt', { session: false });

const session = (req, res, next) => {
  let jwtToken = req.headers.authorization.split(' ')[1];
  pool.getConnection((error, connection) => {
    if (connection) {
      connection.query(`select * from session where token = '${jwtToken}'`, (err, result) => {
        connection.release()
        if (result.length > 0) {
          next()
        }
        else {
          next({ status: 440, err });
        }
      });
    }
  });
}

module.exports = {
  authenticate,
  session
};
