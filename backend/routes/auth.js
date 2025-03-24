import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import authMiddleware from "../middleware/authMiddleware.js"
import dotenv from "dotenv"
import Settings from "../models/Settings.js" // Import Settings model
dotenv.config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET

// Signup Route
router.post("/signup", async (req, res) => {
    try {
        // First check if registration is enabled in settings
        const settings = await Settings.getSingleton()
        if (!settings.enableRegistration) {
            return res.status(403).json({ message: "Registration is currently disabled" })
        }

        const { name, email, password } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({ message: "User already exists" })

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ name, email, password: hashedPassword })
        await newUser.save()

        res.status(201).json({ message: "User created successfully" })
    } catch (error) {
        res.status(500).json({ message: "Error creating user" })
    }
})

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body
        console.log("Login attempt for:", email)

        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({ message: "User not found" })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" })

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" })
        console.log("Token generated for user:", user._id)

        // Set token in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        // Also return token in response for clients that need it
        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error logging in" })
    }
})

// Logout Route
router.post("/logout", (req, res) => {
    res.cookie("token", "", { expires: new Date(0) })
    res.json({ message: "Logged out successfully" })
})

// Get Current User
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password") // Exclude password
        if (!user) return res.status(404).json({ message: "User not found" })

        // Check if token is about to expire (if it expires in less than 1 day)
        const decoded = req.user // Assuming your auth middleware adds the decoded token to req.user
        const currentTime = Math.floor(Date.now() / 1000)
        if (decoded.exp - currentTime < 86400) {
            // Create a new token with extended expiration
            const newToken = jwt.sign({ userId: decoded.userId, role: decoded.role }, process.env.JWT_SECRET, {
                expiresIn: "7d",
            })

            // Set the new token in the response
            res.cookie("token", newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })

            // Also set in header for API clients
            res.setHeader("New-Auth-Token", newToken)
        }

        res.json(user)
    } catch (error) {
        res.status(500).json({ message: "Error fetching user details" })
    }
})

export default router

