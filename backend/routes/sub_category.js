import express from "express"
import SubCategory from "../models/Sub_category.js" // Adjust path as needed
import Category from "../models/Category.js" // Import Category model to validate majorCategory

const router = express.Router()

// POST: Create a new subcategory
router.post("/", async (req, res) => {
    try {
        const { name, description, majorCategory } = req.body

        if (!name || !description || !majorCategory) {
            return res.status(400).json({ message: "All fields are required." })
        }

        // Check if majorCategory exists
        const categoryExists = await Category.findById(majorCategory)
        if (!categoryExists) {
            return res.status(400).json({ message: "Major category not found." })
        }

        // Check if subcategory with the same name exists
        const existingSubCategory = await SubCategory.findOne({ name })
        if (existingSubCategory) {
            return res.status(400).json({ message: "Subcategory already exists." })
        }

        const newSubCategory = new SubCategory({ name, description, majorCategory })
        await newSubCategory.save()

        res.status(201).json({ message: "Subcategory created successfully", subCategory: newSubCategory })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
})

// GET: Fetch all subcategories
router.get("/", async (req, res) => {
    try {
        const subCategories = await SubCategory.find({}).populate("majorCategory")
        res.json(subCategories)
    } catch (error) {
        res.status(500).json({ message: "Error fetching subcategories", error })
    }
})

router.get("/:majorCategoryId", async (req, res) => {
    try {
        const { majorCategoryId } = req.params

        const subCategories = await SubCategory.find({ majorCategory: majorCategoryId })

        res.json(subCategories)
    } catch (error) {
        console.error("Error fetching subcategories:", error)
        res.status(500).json({ message: "Server Error" })
    }
})

// GET: Fetch a single subcategory by ID
router.get("/:id", async (req, res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id).populate("majorCategory", "name")
        if (!subCategory) {
            return res.status(404).json({ message: "Subcategory not found" })
        }
        res.status(200).json(subCategory)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
})

export default router

