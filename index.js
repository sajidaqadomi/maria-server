import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser';
import morgan from 'morgan'
import dotenv from 'dotenv'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import categoryRoutes from './routes/category.js'
import productRoutes from './routes/product.js'
import userRoutes from './routes/user.js'
import cartRoutes from './routes/cart.js'
import stripeRoutes from './routes/stripe.js'
import orderRoutes from './routes/order.js'
import authJwt from './helpers/jwt.js';
import errorHandler from './helpers/error.js';


const app = express()
dotenv.config()

const PORT = process.env.PORT || 5000
const API_URL = process.env.API_URL

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('hello to maria api')
})

app.use(authJwt())
app.use(errorHandler)
// app.use(
//     "/public/uploads",
//     express.static(__dirname + "/public/uploads")
// );

app.use(`/auth`, authRoutes)
app.use(`/users`, userRoutes)
app.use(`/categories`, categoryRoutes)
app.use(`/products`, productRoutes)
app.use(`/carts`, cartRoutes)
app.use(`/orders`, orderRoutes)
app.use(`/checkout`, stripeRoutes)



mongoose.connect(process.env.CONNECTION_URL).then(() => {
    app.listen(PORT, () => {
        console.log(`your Server running on http://localhost:${PORT} `)
    })
}).catch((err) => {
    console.log(err)
})
