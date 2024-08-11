const express = require('express')
const { loginController, registerController, logoutController } = require('../controllers/auth.controller')
const authRouter = express.Router()

authRouter.route('/login')
  .post(loginController)

authRouter.route('/register')
  .post(registerController)

authRouter.route('/logout')
  .get(logoutController)

module.exports = {
  authRouter
};
