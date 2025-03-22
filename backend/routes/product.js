import express from "express"
import Product from "../models/Product.js"

const router = express.Router()

// Get products with category filter
router.get("/", async (req, res) => {
    try {
        const { searchQuery, sortOrder, bestsellers, newArrivals, majorCategories, subCategories } = req.query

        const filter = {}

        // Search filter
        if (searchQuery) {
            filter.name = { $regex: searchQuery, $options: "i" }
        }

        // Bestseller filter
        if (bestsellers === "true") {
            filter.isBestseller = true
        }

        // New arrivals filter (products created within the last 3 days)
        if (newArrivals === "true") {
            const threeDaysAgo = new Date()
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
            filter.createdAt = { $gte: threeDaysAgo }
        }

        // Category filtering (supporting multiple selections)
        if (majorCategories) {
            filter.majorCategory = { $in: majorCategories.split(",") }
        }

        if (subCategories) {
            filter.subCategory = { $in: subCategories.split(",") }
        }

        // Sorting (price: asc/desc)
        const sortOptions = {}
        if (sortOrder === "asc") {
            sortOptions.price = 1
        } else if (sortOrder === "desc") {
            sortOptions.price = -1
        }

        const products = await Product.find(filter)
            .populate("majorCategory", "name")
            .populate("subCategory", "name")
            .sort(sortOptions)

        res.status(200).json(products)
    } catch (error) {
        res.status(500).json({ error: "Error fetching products" })
    }
})

// Fetch a single product by ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("majorCategory subCategory")
        if (!product) return res.status(404).json({ message: "Product not found" })
        res.json(product)
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error })
    }
})

router.post("/", async (req, res) => {
    try {
        const { name, description, price, stock, imageUrl, majorCategory, subCategory } = req.body

        if (!name || !description || !price || !stock || !imageUrl || !majorCategory || !subCategory) {
            return res.status(400).json({ message: "All fields are required." })
        }

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            imageUrl,
            majorCategory,
            subCategory,
        })

        await newProduct.save()
        res.status(201).json({ message: "Product created successfully", product: newProduct })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
})

export default router

