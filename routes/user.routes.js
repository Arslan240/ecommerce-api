const express = require('express');
const { getAllUsers, getSingleUser, updateSingleUser, showCurrentUser, updateUserPassword } = require('../controllers/user.controller');
const { authenticateMiddleware, authorizeMiddleware } = require('../middleware/authentication');
const userRouter = express.Router()

userRouter.route('/')
  .get(authenticateMiddleware,authorizeMiddleware('admin','owner'),getAllUsers) //all users

userRouter.route('/showMe').get(authenticateMiddleware,showCurrentUser)
userRouter.route('/updateUser').patch(authenticateMiddleware,updateSingleUser)
userRouter.route('/updateUserPassword').patch(authenticateMiddleware,updateUserPassword)

userRouter.route('/:userId').get(authenticateMiddleware,getSingleUser) //singleuser



module.exports = {
  userRouter
};
