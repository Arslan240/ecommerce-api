require('dotenv').config()
require('express-async-errors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const rateLimiter = require('express-rate-limit')
const xss = require('xss-clean')
const helmet = require('helmet')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')
const connectDB = require('./db/connect')
const { authRouter } = require('./routes/auth.routes')

const express = require('express')
const app = express()

app.use(express.static('./public'))
app.use(fileUpload())

app.set('trust proxy', 1)
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60
}))
app.use(helmet())
app.use(cors()) // if frontend is on different domain then must setup proxy on frontend for cookies to work properly.
app.use(xss())
app.use(mongoSanitize())

app.use(morgan("tiny"))
app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET)) //secret for signing cookies

// middlewares
const errorHandlerMiddleware = require('./middleware/error-handler')
const notFoundMiddleware = require('./middleware/not-found')
const { userRouter } = require('./routes/user.routes')
const productRouter = require('./routes/product.routes')
const reviewRouter = require('./routes/review.routes')
const orderRouter = require('./routes/order.routes')


app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products',productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter)

app.use( notFoundMiddleware)
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 5000
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    console.log('DB connected successfully...');
    app.listen(PORT, () => console.log(`API is listening at Port ${PORT}...`))
  } catch (error) {
    console.log(error);
  }
}

start()