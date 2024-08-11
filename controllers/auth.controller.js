const { StatusCodes } = require("http-status-codes");
const {BadRequestError, UnauthenticatedError} = require("../errors");
const User = require("../models/User.model");
const { createJWT } = require("../utils/");
const { createTokenUser, attachJWTtoResCookies } = require("../utils/jwt");

const registerController = async (req,res,next) => {
  console.log(req.body);
  const {name,email,password} = req.body
  if(!name || !email || !password){
    return next(new BadRequestError("Please provide name, email and password"))
  }

  // if user already exists
  const isExists = await User.findOne({email})
  if(isExists){
    return next(new BadRequestError("Email already exists"))
  }

  // only first user can be registered as a admin. This might be not the best possible way. because if in some case, some user becomes 1st user, he'll be admin without anyones' knowledge
  const count = await User.countDocuments({})
  const role = count === 0 ? "admin" : "user"

  // const user = await User.create(req.body)
  const user = await User.create({name,email,password,role})

  const tokenUser = createTokenUser({user})
  attachJWTtoResCookies({res,tokenUser})
  res.status(StatusCodes.CREATED).json({user:tokenUser})
}

const loginController = async (req,res,next) => {
  console.log(req.signedCookies);
  const {email,password} = req.body
  if(!email || !password) {
    return next(new UnauthenticatedError("Please provide email and password"))
  }

  const user = await User.findOne({email})
  if(!user){
    return next(new UnauthenticatedError("User doesn't exists"))
  }

  const isMatch = await user.comparePassword(password)
  if(!isMatch){
    return next(new UnauthenticatedError("Invalid email or password"))
  }

  // adding 
  const tokenUser = createTokenUser({user})
  attachJWTtoResCookies({res,tokenUser})

  res.status(StatusCodes.OK).send({user:tokenUser})
}
const logoutController = async (req,res,next) => {
  res.cookie('token', 'dsfasdfsad',{
    httpOnly: true,
    expires: new Date(Date.now())
  })
  res.status(StatusCodes.OK).json({msg: 'Logged out successfully'})
}

module.exports = {
  loginController,
  registerController,
  logoutController
};
