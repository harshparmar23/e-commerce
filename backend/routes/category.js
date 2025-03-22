import express from "express";
import Category from "../models/Category.js"; // Adjust path if needed

const router = express.Router();

// POST: Create a new category
router.post("/", async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists." });
        }

        const newCategory = new Category({ name, description });
        await newCategory.save();

        res.status(201).json({ message: "Category created successfully", category: newCategory });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET: Fetch all categories
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error });
    }
});


// GET: Fetch a single category by ID
router.get("/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
