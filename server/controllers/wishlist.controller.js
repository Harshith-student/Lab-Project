import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToWishlist = async (req, res) => {
    try {
        const {productId} = req.params;

        // 1. Validate Product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // 2. Check if product exists in database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 3. Find authenticated customer (attached by auth.middleware.js)
        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // 4. Check for duplicates (409 Conflict)
        const isAlreadyWishlisted = customer.wishlist.some(
            (id) => id.toString() === productId
        );
        if (isAlreadyWishlisted) {
            return res.status(409).json({
                success: false,
                message: "Product is already in your wishlist"
            });
        }

        // 5. Add product to wishlist and save
        customer.wishlist.push(productId);
        await customer.save();
        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Get current user's wishlist with populated Product data
// @route   GET /wishlist
// @access  Private
export const getWishlist = async (req, res) => {
    try {
        // Find customer and populate the wishlist array with product details
        const customer = await Customer.findById(req.customer._id).populate({
            path: "wishlist",
            select: "name price category image stock description"
        });
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }
        return res.status(200).json({
            success: true,
            count: customer.wishlist.length,
            wishlist: customer.wishlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Remove product from user's wishlist
// @route   DELETE /wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        // 1. Validate Product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }
        // 2. Find customer
        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }
        // 3. Check if product exists in customer's wishlist
        const exists = customer.wishlist.some(
            (id) => id.toString() === productId
        );
        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in your wishlist"
            });
        }
        // 4. Remove product ID from wishlist array
        customer.wishlist = customer.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await customer.save();
        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

