import express from "express"
import mongoose from "mongoose"
import Wishlist from "../models/Wishlist.js"
import Product from "../models/Product.js"

const router = express.Router()

// Add product to wishlist
router.post("/add", async (req, res) => {
    try {
        const { userId, productId } = req.body

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid ObjectId" })
        }

        // Check if product exists
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }

        let wishlist = await Wishlist.findOne({ userId })

        if (!wishlist) {
            // Create new wishlist if it doesn't exist
            wishlist = new Wishlist({
                userId,
                products: [{ productId }],
            })
        } else {
            // Check if product already exists in wishlist
            const productExists = wishlist.products.some((item) => item.productId.toString() === productId)

            if (productExists) {
                return res.status(400).json({ error: "Product already in wishlist" })
            }

            // Add product to wishlist
            wishlist.products.push({ productId })
        }

        await wishlist.save()
        res.status(200).json({ message: "Product added to wishlist", wishlist })
    } catch (error) {
        console.error("Error adding to wishlist:", error)
        res.status(500).json({ error: error.message })
    }
})

// Get user's wishlist
router.get("/:userId", async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.params.userId }).populate("products.productId")
        if (!wishlist) {
            return res.status(200).json({ message: "Wishlist not found", products: [] })
        }

        res.json(wishlist)
    } catch (error) {
        console.error("Error fetching wishlist:", error)
        res.status(500).json({ error: error.message })
    }
})

// Remove product from wishlist
router.delete("/:userId/:productId", async (req, res) => {
    try {
        const { userId, productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid ObjectId" })
        }

        const wishlist = await Wishlist.findOne({ userId })

        if (!wishlist) {
            return res.status(404).json({ error: "Wishlist not found" })
        }

        // Remove product from wishlist
        wishlist.products = wishlist.products.filter((item) => item.productId.toString() !== productId)

        await wishlist.save()
        res.status(200).json({ message: "Product removed from wishlist" })
    } catch (error) {
        console.error("Error removing from wishlist:", error)
        res.status(500).json({ error: error.message })
    }
})

// Clear wishlist
router.delete("/:userId", async (req, res) => {
    try {
        const { userId } = req.params

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid ObjectId" })
        }

        await Wishlist.findOneAndUpdate({ userId }, { $set: { products: [] } }, { new: true })

        res.status(200).json({ message: "Wishlist cleared successfully" })
    } catch (error) {
        console.error("Error clearing wishlist:", error)
        res.status(500).json({ error: error.message })
    }
})

export default router

