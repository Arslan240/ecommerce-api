const { UnauthenticatedError, UnauthorizedError } = require("../errors");
const { verifyJWT } = require("../utils");

const authenticateMiddleware = async (req, res, next) => {
  const { token } = req.signedCookies

  if (!token) {
    return next(new UnauthenticatedError('Authentication Invalid'))
  }
  const { userId, name, role } = verifyJWT({ token })

  req.user = {
    userId,
    name,
    role
  }
  next()
}

// if we have a lot of roles, then we can just pass in the roles that can access that route. So we get all roles in authorizeMiddleware. We need to pass a callback function thats why we return a function from this function. Returned function will get err,req,res,next from express. Because that function will be called by express
const authorizeMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new UnauthorizedError('Unauthorized to access this route'))
    }
    next()
  }
}

module.exports = {
  authenticateMiddleware,
  authorizeMiddleware
};
