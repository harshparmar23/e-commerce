import express from "express"
import mongoose from "mongoose"
import Rating from "../models/Rating.js"
import Product from "../models/Product.js"
import Order from "../models/Order.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// Submit a product rating
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { productId, orderId, rating, review } = req.body
        const userId = req.userId

        // Validate rating value
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({ error: "Rating must be an integer between 1 and 5" })
        }

        // Check if the order exists and belongs to the user
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        if (order.userId.toString() !== userId) {
            return res.status(403).json({ error: "You can only rate products from your own orders" })
        }

        // Check if the order is delivered
        if (order.status !== "delivered") {
            return res.status(400).json({ error: "You can only rate products from delivered orders" })
        }

        // Check if the product exists in the order
        const productExists = order.products.some((item) => item.productId.toString() === productId)

        if (!productExists) {
            return res.status(400).json({ error: "This product is not in the specified order" })
        }

        // Check if the user has already rated this product for this order
        const existingRating = await Rating.findOne({
            userId,
            productId,
            orderId,
        })

        if (existingRating) {
            // Update existing rating
            existingRating.rating = rating
            existingRating.review = review || ""
            await existingRating.save()

            // Recalculate average rating
            await updateProductAverageRating(productId)

            return res.status(200).json({ message: "Rating updated successfully", rating: existingRating })
        }

        // Create new rating
        const newRating = new Rating({
            userId,
            productId,
            orderId,
            rating,
            review: review || "",
        })

        await newRating.save()

        // Update product's average rating
        await updateProductAverageRating(productId)

        res.status(201).json({ message: "Rating submitted successfully", rating: newRating })
    } catch (error) {
        console.error("Error submitting rating:", error)

        if (error.code === 11000) {
            return res.status(400).json({ error: "You have already rated this product for this order" })
        }

        res.status(500).json({ error: "Failed to submit rating" })
    }
})

// Get all ratings for a product
router.get("/product/:productId", async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid product ID" })
        }

        const ratings = await Rating.find({ productId }).populate("userId", "name").sort({ createdAt: -1 })

        res.json(ratings)
    } catch (error) {
        console.error("Error fetching product ratings:", error)
        res.status(500).json({ error: "Failed to fetch ratings" })
    }
})

// Get all ratings by a user
router.get("/user", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId

        const ratings = await Rating.find({ userId }).populate("productId", "name imageUrl").sort({ createdAt: -1 })

        res.json(ratings)
    } catch (error) {
        console.error("Error fetching user ratings:", error)
        res.status(500).json({ error: "Failed to fetch ratings" })
    }
})

// Check if user can rate a product (has ordered and received it)
router.get("/can-rate/:productId", authMiddleware, async (req, res) => {
    try {
        const { productId } = req.params
        const userId = req.userId

        // Find delivered orders containing this product
        const orders = await Order.find({
            userId,
            status: "delivered",
            "products.productId": productId,
        })

        if (orders.length === 0) {
            return res.json({ canRate: false, message: "You need to purchase and receive this product before rating it" })
        }

        // Check if user has already rated this product
        const existingRatings = await Rating.find({
            userId,
            productId,
        })

        // If user has rated for all orders, they can't rate again
        if (existingRatings.length >= orders.length) {
            return res.json({ canRate: false, message: "You have already rated this product" })
        }

        // Find orders that haven't been rated yet
        const ratedOrderIds = existingRatings.map((rating) => rating.orderId.toString())
        const unratedOrders = orders.filter((order) => !ratedOrderIds.includes(order._id.toString()))

        res.json({
            canRate: true,
            orderId: unratedOrders[0]._id, // Provide the first unrated order ID
            message: "You can rate this product",
        })
    } catch (error) {
        console.error("Error checking rating eligibility:", error)
        res.status(500).json({ error: "Failed to check rating eligibility" })
    }
})

// Helper function to update a product's average rating
async function updateProductAverageRating(productId) {
    try {
        // Get all ratings for the product
        const ratings = await Rating.find({ productId })

        if (ratings.length === 0) {
            await Product.findByIdAndUpdate(productId, { avgRating: 0 })
            return
        }

        // Calculate average rating
        const totalRating = ratings.reduce((sum, item) => sum + item.rating, 0)
        const avgRating = Math.round(totalRating / ratings.length) // Round to nearest integer

        // Update product
        await Product.findByIdAndUpdate(productId, { avgRating })
    } catch (error) {
        console.error("Error updating product average rating:", error)
        throw error
    }
}

export default router

