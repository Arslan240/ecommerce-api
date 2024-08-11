const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require("../errors")
const Order = require('../models/Order.model')
const Product = require("../models/Product.model")
const { checkPermissions } = require('../utils')

const getAllOrders = async (req, res, next) => {
  const orders = await Order.find({})

  res.status(StatusCodes.OK).json({orders, count: orders.length})
}
const createOrder = async (req, res, next) => {
  const { tax, shippingFee, items } = req.body
  if (!items || items.length < 1) {
    return next(new BadRequestError('Please provide cart items'))
  }

  if (!tax, !shippingFee) {
    return next(new BadRequestError('Please provide tax and shipping Fee'))
  }

  let orderItems = []
  let subtotal = 0

  for (const item of items) {
    const { product: productId } = item

    const product = await Product.findById(productId)

    if (!product) {
      return next(new NotFoundError(`Product with id ${productId} not found`))
    }

    const { name, price, image, _id } = product

    const singleOrderItem = {
      name,
      image,
      price,
      product: _id,
      amount: item.amount
    }
    orderItems = [...orderItems, singleOrderItem]

    subtotal += (item.amount * price)
  }

  // total amount of order
  const total = tax + shippingFee + subtotal
  // stripe clientsecret
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: "usd"
  })

  const order = await Order.create({
    user: req.user.userId,
    shippingFee,
    tax,
    total,
    clientSecret: paymentIntent.client_secret,
    cartItems: orderItems,
    subtotal,
  })

  res.status(StatusCodes.CREATED).json({order, payment_client_secret: order.clientSecret})
}
const updateOrder = async (req, res, next) => {
  const {id} = req.params
  const {paymentIntentId} = req.body
  const order = await Order.findById(id)
  if (order){
    checkPermissions(req.user, order.user)
  }
  if(!order){
    return next(new NotFoundError(`Order with id ${id} not found.`))
  }

  order.paymentIntentId = paymentIntentId
  order.status = 'paid'
  await order.save()
  res.status(StatusCodes.OK).json({order, msg: `Order with id ${id} update successfully`})
}
const getSingleOrder = async (req, res, next) => {
  const {id} = req.params
  const order = await Order.findById(id)
  
  if(order){
    checkPermissions(req.user,order.user)
  }
  
  if(!order){
    return next(new NotFoundError(`Order with id ${id} not found.`))
  }


  res.status(StatusCodes.OK).json(order)
}
const showMyOrders = async (req, res, next) => {
  const orders = await Order.find({user: req.user.userId})
  res.status(StatusCodes.OK).json({orders, count: orders.length})
}

module.exports = {
  getAllOrders,
  createOrder,
  updateOrder,
  getSingleOrder,
  showMyOrders,
};
