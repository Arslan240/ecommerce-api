const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide rating']
  },
  title: {
    type: String,
    trim: true,
    required: [true, 'Please provide title of review'],
    maxlength: 100
  },
  comment: {
    type: String,
    trim: true,
    required: [true, 'Please provide comment'],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide owning user of review']
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Please provide product Id']
  },
}, { timestamps: true })

ReviewSchema.index({ user: 1, product: 1 }, { unique: true })

ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { 'product': productId } },
    { $group: {
      _id: productId,
      averageRating: { $avg: '$rating' },
      numOfReviews: {$sum: 1}
    } }
  ])
  console.log(result);
  // if there are no reviews then result will be nothing, so we first check if result exists by ?. optional chaining
  try {
    const product = await this.model('Product').findByIdAndUpdate(productId,{
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      numOfReviews: result[0]?.numOfReviews || 0
    })
  } catch (error) {
    console.log(error);
  }
  // console.log(productId);
}

ReviewSchema.post('save', async function () {
  console.log('post');
  this.constructor.calculateAverageRating(this.product)
})

ReviewSchema.post('deleteOne', { document: true }, async function () { // deleteOne by default is query middleware, document:true makes it document middleware measn this points to the document deleted.
  console.log('delete');
  this.constructor.calculateAverageRating(this.product)
})

module.exports = mongoose.model('Review', ReviewSchema)