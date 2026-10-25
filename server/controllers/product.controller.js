import mongoose from "mongoose"
import Product from "../models/product.model.js"

// Task 2 — Create Product API (POST /products)
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body

        // Validation for missing fields
        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, description, price, category, image, and stock are mandatory."
            })
        }

        const numericPrice = Number(price)
        const numericStock = Number(stock)

        // Validation for price
        if (isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid price: Price must be a number greater than 0."
            })
        }

        // Validation for stock
        if (isNaN(numericStock) || numericStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid stock: Stock cannot be negative."
            })
        }

        const newProduct = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: numericPrice,
            category: category.trim(),
            image: image.trim(),
            stock: numericStock
        })

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || error
        })
    }
}

// Task 3, 5 & Bonus — Get All Products API with Search, Category Filter & Sorting (GET /products)
export const getProducts = async (req, res) => {
    try {
        const { search, category, sort } = req.query

        // Build query dynamically
        const query = {}

        // Search by name (case-insensitive)
        if (search && search.trim() !== '') {
            query.name = { $regex: search.trim(), $options: 'i' }
        }

        // Category filter (case-insensitive)
        if (category && category.trim() !== '' && category.trim().toLowerCase() !== 'all') {
            query.category = { $regex: `^${category.trim()}$`, $options: 'i' }
        }

        // Handle dynamic sorting
        let sortOption = { createdAt: -1 } // Default: newest first
        if (sort === 'price_asc') {
            sortOption = { price: 1 }
        } else if (sort === 'price_desc') {
            sortOption = { price: -1 }
        } else if (sort === 'newest') {
            sortOption = { createdAt: -1 }
        }

        const products = await Product.find(query).sort(sortOption)

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || error
        })
    }
}

// Task 4 — Get Single Product API (GET /products/:id)
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        // Validate MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format."
            })
        }

        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            })
        }

        return res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message || error
        })
    }
}

// Helper Endpoint — Seed Initial Products
export const seedProducts = async (req, res) => {
    try {
        const existingCount = await Product.countDocuments()
        if (existingCount > 0) {
            const products = await Product.find()
            return res.status(200).json({
                success: true,
                message: "Products already exist in database.",
                count: products.length,
                products
            })
        }

        const sampleProducts = [
            {
                name: "Noise Cancelling Headphones",
                description: "Wireless over-ear headphones with active noise cancellation, 30-hour battery life, and ultra-crisp audio delivery.",
                price: 4999,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
                stock: 25
            },
            {
                name: "RGB Mechanical Keyboard",
                description: "Pro-grade tactile mechanical gaming keyboard with customizable per-key RGB lighting and durable aluminum casing.",
                price: 2999,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
                stock: 12
            },
            {
                name: "Ultra Precision Wireless Mouse",
                description: "Ergonomic wireless mouse with 26,000 DPI optical sensor, hyper-fast scroll wheel, and multi-device connection support.",
                price: 1899,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
                stock: 30
            },
            {
                name: "Minimalist Leather Backpack",
                description: "Handcrafted genuine leather backpack with dedicated 15-inch laptop sleeve and water-resistant finish.",
                price: 3499,
                category: "Fashion",
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
                stock: 15
            },
            {
                name: "Smart Fitness Watch",
                description: "High-definition AMOLED display smartwatch with heart rate monitoring, SPO2 tracking, GPS, and 14-day battery life.",
                price: 5999,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
                stock: 8
            },
            {
                name: "Ceramic Coffee Mug Set",
                description: "Set of 4 matte-finish ceramic coffee mugs crafted for heat retention and comfortable ergonomic grip.",
                price: 899,
                category: "Home",
                image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
                stock: 50
            },
            {
                name: "Clean Code Architectural Guide",
                description: "Comprehensive software engineering handbook covering design patterns, refactoring techniques, and clean architecture principles.",
                price: 1299,
                category: "Books",
                image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                stock: 20
            },
            {
                name: "Ergonomic Mesh Office Chair",
                description: "Breathable high-back mesh chair with adjustable lumbar support, 3D armrests, and smooth gliding caster wheels.",
                price: 8499,
                category: "Home",
                image: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=600&auto=format&fit=crop&q=80",
                stock: 5
            }
        ]

        const seeded = await Product.insertMany(sampleProducts)

        return res.status(201).json({
            success: true,
            message: "Database seeded successfully with sample products",
            count: seeded.length,
            products: seeded
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to seed products",
            error: error.message || error
        })
    }
}
