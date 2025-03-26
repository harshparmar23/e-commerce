// userRoutes.js
import express from "express"
import User from "../models/User.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// Get user profile
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password")

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json(user)
    } catch (error) {
        console.error("Error fetching user profile:", error)
        res.status(500).json({ error: "Server error" })
    }
})

// Add a new address to user
router.post("/:userId/address", authMiddleware, async (req, res) => {
    try {
        const userId = req.params.userId

        // Log for debugging
        console.log("Adding address for user:", userId)
        console.log("Auth user ID:", req.userId)
        console.log("Request body:", req.body)

        // Ensure user can only modify their own data
        if (req.userId !== userId) {
            console.log("Authorization failed: User IDs do not match")
            return res.status(403).json({ error: "Not authorized to perform this action" })
        }

        const { street, city, state, country, zipCode } = req.body

        // Validate required fields
        if (!street || !city || !state || !country || !zipCode) {
            return res.status(400).json({ error: "All address fields are required" })
        }

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Create new address object
        const newAddress = {
            street,
            city,
            state,
            country,
            zipCode,
        }

        // Add address to user's addresses array
        user.addresses.push(newAddress)
        await user.save()

        // Return the newly added address with its generated _id
        const addedAddress = user.addresses[user.addresses.length - 1]

        res.status(201).json(addedAddress)
    } catch (error) {
        console.error("Error adding address:", error)
        res.status(500).json({ error: "Server error: " + error.message })
    }
})

// Get all addresses for a user
router.get("/:userId/addresses", authMiddleware, async (req, res) => {
    try {
        // Ensure user can only access their own data
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ error: "Not authorized to access this data" })
        }

        const user = await User.findById(req.params.userId).select("addresses")

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json(user.addresses)
    } catch (error) {
        console.error("Error fetching addresses:", error)
        res.status(500).json({ error: "Server error" })
    }
})

// Update an address
router.put("/:userId/address/:addressId", authMiddleware, async (req, res) => {
    try {
        // Ensure user can only modify their own data
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ error: "Not authorized to perform this action" })
        }

        const { street, city, state, country, zipCode } = req.body

        // Validate required fields
        if (!street || !city || !state || !country || !zipCode) {
            return res.status(400).json({ error: "All address fields are required" })
        }

        const user = await User.findById(req.params.userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Find the address to update
        const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === req.params.addressId)

        if (addressIndex === -1) {
            return res.status(404).json({ error: "Address not found" })
        }

        // Update the address
        user.addresses[addressIndex] = {
            _id: user.addresses[addressIndex]._id, // Preserve the original _id
            street,
            city,
            state,
            country,
            zipCode,
        }

        await user.save()

        res.json(user.addresses[addressIndex])
    } catch (error) {
        console.error("Error updating address:", error)
        res.status(500).json({ error: "Server error" })
    }
})

// Delete an address
router.delete("/:userId/address/:addressId", authMiddleware, async (req, res) => {
    try {
        // Ensure user can only modify their own data
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ error: "Not authorized to perform this action" })
        }

        const user = await User.findById(req.params.userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Filter out the address to be deleted
        user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.addressId)

        await user.save()

        res.json({ message: "Address deleted successfully" })
    } catch (error) {
        console.error("Error deleting address:", error)
        res.status(500).json({ error: "Server error" })
    }
})

// Add these new routes after the existing routes

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ error: "Name and email are required" })
        }

        // Check if email is already in use by another user
        const existingUser = await User.findOne({ email, _id: { $ne: req.userId } })
        if (existingUser) {
            return res.status(400).json({ error: "Email is already in use" })
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(req.userId, { name, email }, { new: true }).select("-password")

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" })
        }

        res.json(updatedUser)
    } catch (error) {
        console.error("Error updating profile:", error)
        res.status(500).json({ error: "Server error" })
    }
})

// Update user password
router.put("/password", authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current password and new password are required" })
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({ error: "New password must be at least 6 characters long" })
        }

        // Get user with password
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Check if current password is correct
        const bcrypt = await import("bcryptjs")
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return res.status(400).json({ error: "Current password is incorrect" })
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(newPassword, salt)

        await user.save()

        res.json({ message: "Password updated successfully" })
    } catch (error) {
        console.error("Error updating password:", error)
        res.status(500).json({ error: "Server error" })
    }
})

export default router

