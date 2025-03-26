import express from "express"
import Coupon from "../models/Coupon.js"
import authMiddleware from "../middleware/authMiddleware.js"
import adminMiddleware from "../middleware/adminMiddleware.js"

const router = express.Router()

// Create a new coupon (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const couponData = req.body

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: couponData.code.toUpperCase() })
        if (existingCoupon) {
            return res.status(400).json({ error: "Coupon code already exists" })
        }

        const coupon = new Coupon(couponData)
        await coupon.save()

        res.status(201).json(coupon)
    } catch (error) {
        console.error("Error creating coupon:", error)
        res.status(500).json({ error: "Failed to create coupon" })
    }
})

// Fix the route to get all coupons (admin only) - change from /admin to / for consistency
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 })
        res.status(200).json(coupons)
    } catch (error) {
        console.error("Error fetching coupons:", error)
        res.status(500).json({ error: "Failed to fetch coupons" })
    }
})

// Fix the route to get a single coupon by ID (admin only) - change from /admin/:id to /:id for consistency
router.get("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id)
        if (!coupon) {
            return res.status(404).json({ error: "Coupon not found" })
        }
        res.status(200).json(coupon)
    } catch (error) {
        console.error("Error fetching coupon:", error)
        res.status(500).json({ error: "Failed to fetch coupon" })
    }
})

// Update a coupon (admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const couponData = req.body

        // Check if updating code and if it already exists
        if (couponData.code) {
            const existingCoupon = await Coupon.findOne({
                code: couponData.code.toUpperCase(),
                _id: { $ne: req.params.id },
            })

            if (existingCoupon) {
                return res.status(400).json({ error: "Coupon code already exists" })
            }
        }

        const coupon = await Coupon.findByIdAndUpdate(req.params.id, couponData, { new: true, runValidators: true })

        if (!coupon) {
            return res.status(404).json({ error: "Coupon not found" })
        }

        res.status(200).json(coupon)
    } catch (error) {
        console.error("Error updating coupon:", error)
        res.status(500).json({ error: "Failed to update coupon" })
    }
})

// Delete a coupon (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id)

        if (!coupon) {
            return res.status(404).json({ error: "Coupon not found" })
        }

        res.status(200).json({ message: "Coupon deleted successfully" })
    } catch (error) {
        console.error("Error deleting coupon:", error)
        res.status(500).json({ error: "Failed to delete coupon" })
    }
})

// Validate a coupon code (for users)
router.post("/validate", authMiddleware, async (req, res) => {
    try {
        const { code, orderAmount } = req.body

        if (!code || !orderAmount) {
            return res.status(400).json({ error: "Coupon code and order amount are required" })
        }

        // Find the coupon
        const coupon = await Coupon.findOne({ code: code.toUpperCase() })

        if (!coupon) {
            return res.status(404).json({ error: "Invalid coupon code" })
        }

        // Check if coupon is valid
        const validationResult = coupon.isValid(orderAmount)

        if (!validationResult.valid) {
            return res.status(400).json({ error: validationResult.message })
        }

        // Calculate discount
        const discountAmount = coupon.calculateDiscount(orderAmount)

        res.status(200).json({
            coupon,
            discountAmount,
            finalAmount: orderAmount - discountAmount,
        })
    } catch (error) {
        console.error("Error validating coupon:", error)
        res.status(500).json({ error: "Failed to validate coupon" })
    }
})

// Apply a coupon (increment usage count)
router.post("/apply", authMiddleware, async (req, res) => {
    try {
        const { code } = req.body

        if (!code) {
            return res.status(400).json({ error: "Coupon code is required" })
        }

        // Find and update the coupon
        const coupon = await Coupon.findOneAndUpdate(
            { code: code.toUpperCase() },
            { $inc: { usedCount: 1 } },
            { new: true },
        )

        if (!coupon) {
            return res.status(404).json({ error: "Invalid coupon code" })
        }

        res.status(200).json({ message: "Coupon applied successfully", coupon })
    } catch (error) {
        console.error("Error applying coupon:", error)
        res.status(500).json({ error: "Failed to apply coupon" })
    }
})

export default router

