import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import customerRoutes from "./routes/customer.route.js"
import productRoutes from "./routes/product.route.js"
import cookieParser from "cookie-parser"
import cors from 'cors'
import wishlistRoutes from "./routes/wishlist.route.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/order.route.js";



dotenv.config()

const app = express()
const PORT = process.env.PORT || 8090

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return
    try {
        await mongoose.connect(process.env.dbUrl, {
            serverSelectionTimeoutMS: 5000
        })
        console.log("DB Connected Successfully")
    } catch (err) {
        console.error("Database Connection Error:", err.message)
    }
}

// Initial connection attempt
connectDB()

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
        if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    if (
        req.path.startsWith('/customers') ||
        req.path.startsWith('/products') ||
        req.path.startsWith('/wishlist') ||
        req.path.startsWith('/cart') ||
        req.path.startsWith('/orders')
    ) {
        if (mongoose.connection.readyState !== 1) {
            await connectDB()
        }
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                message: "Database Connection Error: Cannot connect to MongoDB Server.",
                error: "MongoDB Atlas cluster is unreachable. Please check your network connection."
            })
        }
    }
    next()
})

app.use("/customers", customerRoutes)
app.use("/products", productRoutes)
app.use("/wishlist", wishlistRoutes)
app.use('/cart', cartRoutes)
app.use('/orders', orderRoutes)
app.listen(PORT, () => {
    console.log(`Server Started at http://localhost:${PORT}`)
})
