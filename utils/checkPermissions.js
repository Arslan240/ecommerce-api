const { UnauthorizedError } = require("../errors")

const checkPermissions = (reqUser, resUserId) => {
  if(reqUser.role === 'admin') return
  if(reqUser.userId === resUserId.toString()) return
  throw new UnauthorizedError('Unauthorized to access this route')
}

module.exports = checkPermissions