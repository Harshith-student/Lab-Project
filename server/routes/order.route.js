import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    devSimulateSignature
} from "../controllers/order.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const orderRoutes = express.Router();

// All order routes are protected by authentication middleware
orderRoutes.post("/create-payment-order", isAuthenticated, createPaymentOrder);
orderRoutes.post("/", isAuthenticated, createPaymentOrder);
orderRoutes.post("/verify-payment", isAuthenticated, verifyPayment);
orderRoutes.get("/", isAuthenticated, getMyOrders);
orderRoutes.get("/:id", isAuthenticated, getOrderById);
orderRoutes.patch("/:id/status", isAuthenticated, updateOrderStatus);
orderRoutes.post("/dev/simulate-signature", isAuthenticated, devSimulateSignature);

export default orderRoutes;
