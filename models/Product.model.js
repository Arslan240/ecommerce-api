const mongoose = require('mongoose')
const Review = require('./Review.model')

// mongoose.set('debug', true);

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please provide product name'],
    maxlength: [100, 'Name can not be more than 100 characters long']
  },
  price: {
    type: Number,
    required:[true, 'Please provide product price'],
    default: 0
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    maxlength: [1000, 'Description can not be more than 1000 characters long']
  },
  image: {
    type: String,
    default: '/uploads/example.jpg'
  },
  category: {
    type: String,
    required: [true, 'Please provide description'],
    enum: ['office','kitchen','bedroom']
  },
  company: {
    type: String,
    required: [true, 'Please provide description'],
    enum: {
      values: ['ikea','liddy','marcos'],
      message: '{{VALUE}} is not supported'
    }
  },
  colors: {
    type: [String],
    default: ['#222'], //required doen's work for array of strings, so default value
    required: [true, 'Please provide color of product'],
  },
  featured: {
    type: Boolean,
    default: false    
  },
  freeShipping: {
    type: Boolean,
    default: false,
  },
  inventory: {
    type: Number,
    required: true,
    default: 15
  },
  averageRating: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
},{timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}})

ProductSchema.virtual('reviews', {
  ref: 'Review', // foreign model name
  localField: '_id',
  foreignField: 'product',
  justOne: false, // give me a list of all matching reviews for this product. In some cases we want just one value, then it'll be true
  // match: { rating: 5} // this will only return where rating is 5
})

ProductSchema.pre('deleteOne',{document: true}, async function (next){
  await this.model('Review').deleteMany({product: this._id})
  next()
})

ProductSchema.index({name:1, company: 1}, {unique: true})

module.exports = mongoose.model('Product', ProductSchema)


// console.log(ProductSchema.indexes());

