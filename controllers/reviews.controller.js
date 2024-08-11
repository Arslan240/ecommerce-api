const { StatusCodes } = require("http-status-codes")
const Review = require("../models/Review.model")
const { NotFoundError, BadRequestError } = require("../errors")
const Product = require("../models/Product.model")
const { checkPermissions } = require("../utils")

const getAllReviews = async (req,res,next) => {
  const reviews = await Review.find({})
    .populate({path:'product', select: 'name company price'})
    .populate({path:'user', select: 'name'})
  
  res.status(StatusCodes.OK).json({reviews,len: reviews.length})
}

const createReview = async (req,res,next) => {
  const {product: productId} = req.body
  if(!productId){
    return next(new BadRequestError('Please provide product id'))
  }
  
  const product = await Product.findById(productId).select('-password')
  if(!product){
    return next(new BadRequestError(`No product found for id ${productId}`))
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId
  })
  
  if(alreadySubmitted){
    return next(new BadRequestError(`Already submitted a review for the product ${productId}`))
  }  

  req.body.user = req.user.userId
  const review = await Review.create(req.body)
  res.status(StatusCodes.CREATED).json({review})
}

const updateAReview = async (req,res,next) => {
  const {id} = req.params
  const {rating,title,comment} = req.body
  
  const review = await Review.findById(id)
  
  if(!review){
    return next(new NotFoundError(`Review with id ${id} not found`))
  }

  checkPermissions(req.user,review.user)
  
  review.rating = rating
  review.title = title
  review.comment = comment
  
  await review.save()
  
  res.status(StatusCodes.OK).json({review, msg: `Review with id ${id} Updated Successfully`})
}

const deleteAReview = async (req,res,next) => {
  const {id} = req.params
  const review = await Review.findById(id)

  if(!review){
    return next(new NotFoundError(`Review with id ${id} not found`))
  }
  
  checkPermissions(req.user,review.user)

  await review.deleteOne()

  res.status(StatusCodes.OK).json({msg: `Review with id ${id} deleted successfully`})
}

const getSingleReview = async (req,res,next) => {
  const {id} = req.params
  const review = await Review.findById(id).populate({path:'product', select: 'name company price'})
  if(!review){
    return next(new NotFoundError(`Review with id ${id} not found`))
  }
  res.status(StatusCodes.OK).json({review})
}


module.exports = {
  getAllReviews,
  createReview,
  updateAReview,
  deleteAReview,
  getSingleReview,
};
