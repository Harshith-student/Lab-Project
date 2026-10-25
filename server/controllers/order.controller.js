import mongoose from "mongoose";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";

// @desc    Validate cart, calculate total, create pending order and Razorpay order
// @route   POST /orders/create-payment-order (and POST /orders)
// @access  Private
export const createPaymentOrder = async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // 1. Verify Cart is not empty
        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty. Please add products to cart before checkout."
            });
        }

        // 2. Validate Shipping Address
        const { shippingAddress } = req.body;
        if (!shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required"
            });
        }

        const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

        if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: "All shipping address fields are required"
            });
        }

        // Check whitespace-only
        if (
            !fullName.trim() ||
            !phone.toString().trim() ||
            !addressLine1.trim() ||
            !city.trim() ||
            !state.trim() ||
            !pincode.toString().trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Address fields cannot be whitespace only"
            });
        }

        // Validate phone format (at least 10 digits)
        const cleanedPhone = phone.toString().trim().replace(/[\s-+]/g, "");
        if (!/^\d{10}$/.test(cleanedPhone)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must contain exactly 10 digits"
            });
        }

        // Validate pincode format (6 digits)
        const cleanedPincode = pincode.toString().trim();
        if (!/^\d{6}$/.test(cleanedPincode)) {
            return res.status(400).json({
                success: false,
                message: "Pincode must contain 6 digits."
            });
        }

        // 3. Re-verify products and stock, calculate total amount on server
        const orderItems = [];
        let calculatedTotal = 0;

        for (const item of customer.cart) {
            const product = await Product.findById(item.product);

            // Recheck product existence
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "One or more products in your cart are no longer available."
                });
            }

            // Recheck stock
            if (item.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }

            const itemPrice = product.price;
            calculatedTotal += itemPrice * item.quantity;

            // Purchase-time snapshot
            orderItems.push({
                product: product._id,
                name: product.name,
                price: itemPrice,
                quantity: item.quantity,
                image: product.image
            });
        }

        // 4. Create Pending ShopKart Order (Status: PENDING_PAYMENT)
        // Note: req.body.totalAmount is intentionally ignored to prevent price tampering
        const shopKartOrder = new Order({
            user: customer._id,
            items: orderItems,
            shippingAddress: {
                fullName: fullName.trim(),
                phone: cleanedPhone,
                addressLine1: addressLine1.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: cleanedPincode
            },
            totalAmount: calculatedTotal,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        await shopKartOrder.save();

        // 5. Create Razorpay Order in Paise (Rupees * 100)
        const amountInPaise = Math.round(calculatedTotal * 100);
        let razorpayOrder;
        const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_51MockShopKartKey";
        const isMockKey = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes("Mock");
        let isMock = isMockKey;

        if (!isMockKey) {
            try {
                razorpayOrder = await razorpay.orders.create({
                    amount: amountInPaise,
                    currency: "INR",
                    receipt: shopKartOrder._id.toString()
                });
            } catch (rzpErr) {
                console.warn("Razorpay API order creation warning:", rzpErr.message);
                isMock = true;
            }
        }

        if (isMock || !razorpayOrder) {
            // Generate a reliable test order ID for simulation mode
            razorpayOrder = {
                id: `order_${shopKartOrder._id.toString().substring(0, 14)}_${Date.now().toString(36)}`,
                amount: amountInPaise,
                currency: "INR",
                status: "created"
            };
        }

        // 6. Save Razorpay Order ID to the ShopKart Order
        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        return res.status(201).json({
            success: true,
            message: "Payment order created successfully",
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: "INR",
            key: keyId,
            isMock
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error during order creation",
            error: error.message
        });
    }
};

// @desc    Verify Razorpay payment signature and confirm ShopKart order
// @route   POST /orders/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }

        const order = await Order.findById(shopKartOrderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Verify order ownership
        if (order.user.toString() !== req.customer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to verify this order"
            });
        }

        // HMAC SHA256 Signature Verification using trusted razorpayOrderId from database
        const secret = process.env.RAZORPAY_KEY_SECRET || "MockShopKartSecret12345";
        const body = order.razorpayOrderId + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            // Payment signature mismatch - do NOT clear cart and keep order PENDING or mark FAILED
            order.paymentStatus = "FAILED";
            await order.save();
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Payment signature is valid!
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // Deduct inventory stock for each purchased item
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear user cart only after verified payment
        const customer = await Customer.findById(req.customer._id);
        if (customer) {
            customer.cart = [];
            await customer.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed successfully",
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error during payment verification",
            error: error.message
        });
    }
};

// @desc    Get all orders of the logged-in customer
// @route   GET /orders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.customer._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error fetching orders",
            error: error.message
        });
    }
};

// @desc    Get single order details by ID
// @route   GET /orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Ownership enforcement: user cannot access someone else's order
        if (order.user.toString() !== req.customer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to view this order"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error fetching order",
            error: error.message
        });
    }
};

// @desc    Update order status progression (Bonus Challenge)
// @route   PATCH /orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.user.toString() !== req.customer._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not authorized to update this order"
            });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error updating order status",
            error: error.message
        });
    }
};

// @desc    Development / Test helper to simulate valid payment signature for test orders
// @route   POST /orders/dev/simulate-signature
// @access  Private
export const devSimulateSignature = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_payment_id } = req.body;

        if (!shopKartOrderId || !razorpay_payment_id) {
            return res.status(400).json({
                success: false,
                message: "shopKartOrderId and razorpay_payment_id are required"
            });
        }

        const order = await Order.findById(shopKartOrderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || "MockShopKartSecret12345";
        const body = order.razorpayOrderId + "|" + razorpay_payment_id;
        const signature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        return res.status(200).json({
            success: true,
            signature,
            razorpay_order_id: order.razorpayOrderId,
            razorpay_payment_id
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error simulating signature",
            error: error.message
        });
    }
};
