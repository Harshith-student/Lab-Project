import jwt from "jsonwebtoken"
import Customer from "../models/customer.model.js"

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies?.token

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const customer = await Customer.findById(decoded.id)

        if (!customer) {
            return res.status(404).json({ message: "Customer Not Found Token Invalid" })
        }

        req.customer = customer
        next()
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token", error: error.message })
    }
}