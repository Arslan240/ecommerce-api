const { StatusCodes } = require("http-status-codes")
const User = require("../models/User.model")
const { NotFoundError, BadRequestError } = require("../errors")
const { createTokenUser, attachJWTtoResCookies, checkPermissions } = require("../utils")

const getAllUsers = async (req,res,next) => {
  const users = await User.find({role: 'user'}).select('-password')
  if(!users){
    res.status(StatusCodes.OK).send({msg: 'No users availabl', data: []})
  }
  res.status(StatusCodes.OK).json({data:users, length: users.length})
}
const getSingleUser = async (req,res,next) => {
  const {userId} = req.params
  const user = await User.findById({_id:userId}).select('-password')

  if(!user){
    return next(new NotFoundError(`User with id ${userId} doesn't exist`))
  }
  checkPermissions(req.user,user._id)
  res.send({user})
}
const showCurrentUser = async (req,res,next) => {
  const {user} = req

  res.json({user})
}

const updateSingleUser = async (req,res,next) => {
  const {name, email} = req.body

  if(!name || !email){
    return next(new BadRequestError("Please provide email and password"))
  }

  // const user = await User.findOneAndUpdate( //doesn't trigger pre save hook.
  //   {_id: req.user.userId},
  //   {name,email},
  //   {new: true, runValidators: true}
  // )
  const user = await User.findById(req.user.userId)
  user.name = name
  user.email = email

  await user.save()

  const tokenUser = createTokenUser({user})
  attachJWTtoResCookies({res,tokenUser})

  console.log(user);
  res.send({user:tokenUser})
}

const updateUserPassword = async (req,res,next) => {
  const {oldPass, newPass} = req.body
  
  if(!oldPass || !newPass){
    return next(new BadRequestError("Please provide old and new password"))
  }

  const {userId} = req.user
  const user = await User.findById(userId)
  const isMatch = await user.comparePassword(oldPass)
  
  if(!isMatch){
    return next(new BadRequestError("Invalid credentials"))
  }

  user.password = newPass
  await user.save()

  res.status(StatusCodes.OK).json({msg:'Password udpated successfully'})
}


module.exports = {
  getAllUsers,
  getSingleUser,
  updateSingleUser,
  showCurrentUser,
  updateUserPassword
};
