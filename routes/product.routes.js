const express = require('express')
const { getAllProducts, getAProduct, updateAProduct, deleteAProduct, createProduct, getAProductReviews, uploadImage } = require('../controllers/product.controller')
const { authenticateMiddleware, authorizeMiddleware } = require('../middleware/authentication')
const router = express.Router()

router.route('/')
  .get(getAllProducts)
  .post([authenticateMiddleware,authorizeMiddleware('admin')],createProduct)

router.route('/uploadImage')
  .post([authenticateMiddleware,authorizeMiddleware('admin')],uploadImage)

router.route('/:id')
  .get(getAProduct)
  .patch([authenticateMiddleware,authorizeMiddleware('admin')],updateAProduct)
  .delete([authenticateMiddleware,authorizeMiddleware('admin')],deleteAProduct)

router.route('/:id/reviews')
  .get(authenticateMiddleware,getAProductReviews)


module.exports = router
