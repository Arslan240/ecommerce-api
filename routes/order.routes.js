const express = require('express')
const { getAllOrders, createOrder, getSingleOrder, updateOrder, showMyOrders } = require('../controllers/order.controller')
const { authenticateMiddleware, authorizeMiddleware } = require('../middleware/authentication')
const router = express.Router()

router.route('/')
  .get([authenticateMiddleware, authorizeMiddleware('admin')],getAllOrders)
  .post(authenticateMiddleware, createOrder)

router.route('/showMyOrders')
  .get(authenticateMiddleware,showMyOrders)

router.route('/:id')
  .get(authenticateMiddleware, getSingleOrder)
  .patch(authenticateMiddleware, updateOrder)

module.exports = router