const jwt = require('jsonwebtoken')

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
  return token
}

const verifyJWT = ({ token }) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET) //failed verification will throw error which will be caught by our middleware
  return payload
}

const createTokenUser = ({ user }) => {
  return {
    userId: user._id,
    name: user.name,
    role: user.role
  }
}

const attachJWTtoResCookies = ({ res, tokenUser }) => {
  const token = createJWT({ payload: tokenUser })
  const hour = 60 * 60 * 1000
  const expiry = 24 * hour

  res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + expiry),
    secure: process.env.NODE_ENV === 'production', //when deploying we'll have a variable NODE_ENV=production, then secure will work
    signed: true //we sign with our secret key, when every cookie is changed we'll know.
  })
}

module.exports = {
  createJWT,
  verifyJWT,
  createTokenUser,
  attachJWTtoResCookies
};
