import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt"
import { genToken } from "../utils/generateToken.js";

// Register Customer

export const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body

        if (!phone || !email || !password || !fullName) {
            return res.status(400).json({ message: "All fields Required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password Length should be greater than 6" })
        }

        const emailExists = await Customer.findOne({ email })

        if (emailExists) {
            return res.status(409).json({ message: "User Already Exists" })
        }

        // Password Security
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newCustomer = await Customer.create({
            fullName,
            email,
            password: hashedPassword,
            phone
        })

        // Token creation
        const token = genToken(newCustomer._id)

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        })

        const customerResponse = newCustomer.toObject()
        delete customerResponse.password

        return res.status(201).json({ message: "Customer Registered", customer: customerResponse })
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message || error })
    }
}

export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password are required" })
        }

        const customer = await Customer.findOne({ email })

        if (!customer) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        const passwordCheck = await bcrypt.compare(password, customer.password)

        if (!passwordCheck) {
            return res.status(401).json({ message: "Invalid Credentials" })
        }

        const token = genToken(customer._id)

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        })

        const customerResponse = customer.toObject()
        delete customerResponse.password

        return res.status(200).json({ message: "Login Successful", customer: customerResponse })

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message || error })
    }
}

export const getCustomer = async (req, res) => {
    const customerResponse = req.customer ? req.customer.toObject() : null
    if (customerResponse) {
        delete customerResponse.password
    }
    return res.status(200).json({ message: "Customer Authenticated", customerData: customerResponse })
}

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password length should be at least 6 characters" })
        }

        const isMatch = await bcrypt.compare(oldPassword, req.customer.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        req.customer.password = hashedPassword
        await req.customer.save()

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message || error })
    }
}

export const logoutCustomer = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        })
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message || error })
    }
}



