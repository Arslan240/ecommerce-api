const checkPermissions = require('./checkPermissions');
const {createJWT,verifyJWT,attachJWTtoResCookies,createTokenUser} = require('./jwt')

module.exports = {
  createJWT,
  verifyJWT,
  createTokenUser,
  attachJWTtoResCookies,
  checkPermissions
};
