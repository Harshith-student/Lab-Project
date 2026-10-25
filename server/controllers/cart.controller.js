import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Helper function to return populated cart
const getPopulatedCart = async (customerId) => {
    const customer = await Customer.findById(customerId).populate({
        path: "cart.product",
        select: "name price category image stock description"
    });
    return customer ? customer.cart : [];
};

// @desc    Add product to cart or increment quantity
// @route   POST /cart/:productId
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate Product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // 2. Find Product in DB
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 3. Find Customer
        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // 4. Check if product already exists in cart
        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        let newQuantity = 1;
        if (cartItemIndex > -1) {
            newQuantity = customer.cart[cartItemIndex].quantity + 1;
        }

        // 5. Stock Validation
        if (newQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Cannot add more. Only ${product.stock} units available in stock.`
            });
        }

        // 6. Update or Add item
        if (cartItemIndex > -1) {
            customer.cart[cartItemIndex].quantity = newQuantity;
        } else {
            customer.cart.push({ product: productId, quantity: 1 });
        }

        await customer.save();

        const updatedCart = await getPopulatedCart(req.customer._id);

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: updatedCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Get current user's cart
// @route   GET /cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        const cart = await getPopulatedCart(req.customer._id);

        return res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Update quantity of a product in cart
// @route   PATCH /cart/:productId
// @access  Private
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        // 1. Validate quantity
        const qtyNum = Number(quantity);
        if (isNaN(qtyNum) || qtyNum < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a valid number of at least 1"
            });
        }

        // 2. Validate Product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        // 3. Find Product in DB for stock check
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 4. Validate stock limit
        if (qtyNum > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Cannot set quantity to ${qtyNum}. Only ${product.stock} units available.`
            });
        }

        // 5. Find Customer & Cart item
        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const cartItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in your cart"
            });
        }

        // 6. Update quantity and save
        cartItem.quantity = qtyNum;
        await customer.save();

        const updatedCart = await getPopulatedCart(req.customer._id);

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: updatedCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Remove product from cart
// @route   DELETE /cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID format"
            });
        }

        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const exists = customer.cart.some(
            (item) => item.product.toString() === productId
        );

        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in your cart"
            });
        }

        customer.cart = customer.cart.filter(
            (item) => item.product.toString() !== productId
        );

        await customer.save();

        const updatedCart = await getPopulatedCart(req.customer._id);

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: updatedCart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};
