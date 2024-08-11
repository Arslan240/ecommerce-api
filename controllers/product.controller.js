const { StatusCodes, TOO_MANY_REQUESTS } = require("http-status-codes")
const { BadRequestError } = require("../errors")
const Product = require("../models/Product.model")
const path = require('path')
const { default: mongoose } = require("mongoose")
const Review = require("../models/Review.model")

const getAllProducts = async (req,res,next) => {
  const products = await Product.find({}).populate('reviews') // .populate is populating from mongoose virtuals, 
  // const products = await Product.aggregate([ // using mongodb aggregation pipeline
  //   { $lookup: {
  //     from: 'reviews',
  //     localField: '_id',
  //     foreignField: 'product',
  //     as: 'Product Reviews'
  //   } }
  // ])


  res.status(StatusCodes.OK).json({products,len: products.length})
}
const createProduct = async (req,res,next) => {
  const {name,price,description,category,company,colors} = req.body
  if(!name || !price || !description || !category || !company || !colors){
    return next(new BadRequestError('Please provide all the details'))
  }
  
  req.body.user = req.user.userId 
  const product = await Product.create(req.body)
  res.status(StatusCodes.CREATED).send({product})
}
const getAProduct = async (req,res,next) => {
  const {id} = req.params
  const product = await Product.findById(id).populate('reviews')
  // const product = await Product.aggregate([ // using aggreagation pipeline
  //   { $match: {_id: new mongoose.Types.ObjectId(id)} },
  //   {
  //     $lookup: {
  //       from: 'reviews',
  //       localField: '_id',
  //       foreignField: 'product',
  //       as: 'Reviews'
  //     }
  //   }
  // ])

  if(!product){
    return next(new BadRequestError(`No Product with id ${id}`))
  }

  res.status(StatusCodes.OK).json({product})
}
const updateAProduct = async (req,res,next) => {
  const {id} = req.params
  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  })

  if(!product){
    return next(new BadRequestError(`No Product with id ${id}`))
  }

  res.status(StatusCodes.OK).json({product})
}
const deleteAProduct = async (req,res,next) => {
  const {id} = req.params
  const product = await Product.findById(id)

  if(!product){
    return next(new BadRequestError(`No Product with id ${id}`))
  }

  await product.deleteOne()

  res.status(StatusCodes.OK).json({msg: `product with ${id} deleted successfully.`})
}

// We can also use mongoose virtuals on Product model. When product is fetched we use .populate('reviews'). It'll give reviews of product
const getAProductReviews = async (req,res,next) => {
  const {id} = req.params
  const reviews = await Review.find({product:id})

  res.status(StatusCodes.OK).json({reviews, count: reviews.length})
}
const uploadImage = async (req,res,next) => {
  if(!req.files){
    return  next(new BadRequestError('Please provide an image file'))
  }
  
  const upImage = req.files.image
  const {mimetype,size,name} = upImage

  if(!mimetype.startsWith('image')){
    return  next(new BadRequestError('Only provide image format'))
  }

  const maxSize = 1024 * 1024
  if(size > maxSize){
    return  next(new BadRequestError('Only provide image smaller than 1MB'))
  }
  
  const imagePath = path.join(__dirname, '../public/uploads/' + `${name}`)
  await upImage.mv(imagePath)

  res.status(StatusCodes.OK).json({img: `${name} uploaded successfully`})
}


module.exports = {
  getAllProducts,
  createProduct,
  getAProduct,
  updateAProduct,
  deleteAProduct,
  getAProduct,
  uploadImage,
  getAProductReviews,
};
