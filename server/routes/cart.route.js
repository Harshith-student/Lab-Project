import express from "express";
import { addToCart, getCart, updateCartQuantity, removeFromCart } from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const cartRoutes = express.Router();

// All cart routes are protected by authentication middleware
cartRoutes.post("/:productId", isAuthenticated, addToCart);
cartRoutes.get("/", isAuthenticated, getCart);
cartRoutes.patch("/:productId", isAuthenticated, updateCartQuantity);
cartRoutes.delete("/:productId", isAuthenticated, removeFromCart);

export default cartRoutes;
