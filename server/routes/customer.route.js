import express from "express"
import { loginCustomer, registerCustomer, getCustomer, logoutCustomer, changePassword } from "../controllers/customer.controller.js"
import { isAuthenticated } from "../middlewares/auth.middleware.js"
const customerRoutes = express.Router()

customerRoutes.post('/register', registerCustomer)
customerRoutes.post('/login', loginCustomer)
customerRoutes.get('/me', isAuthenticated, getCustomer)
customerRoutes.post('/logout', logoutCustomer)
customerRoutes.patch('/change-password', isAuthenticated, changePassword)

export default customerRoutes
