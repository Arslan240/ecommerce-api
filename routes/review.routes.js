const express = require('express')
const { getAllReviews, createReview, getSingleReview, updateAReview, deleteAReview } = require('../controllers/reviews.controller')
const { authenticateMiddleware } = require('../middleware/authentication')
const router = express.Router()


console.log('hello');
router.route('/')
  .get(getAllReviews)
  .post(authenticateMiddleware,createReview)

router.route('/:id')
  .get(getSingleReview)
  .patch(authenticateMiddleware,updateAReview)
  .delete(authenticateMiddleware,deleteAReview)

module.exports = router