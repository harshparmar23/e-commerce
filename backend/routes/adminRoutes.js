import express from "express"
import adminMiddleware from "../middleware/adminMiddleware.js"
import Product from "../models/Product.js"
import Category from "../models/Category.js"
import SubCategory from "../models/Sub_category.js"
import User from "../models/User.js"
import Order from "../models/Order.js"

const router = express.Router()

// Apply admin middleware to all routes
router.use(adminMiddleware)

// Dashboard statistics
router.get("/dashboard", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" })
        const totalProducts = await Product.countDocuments()
        const totalOrders = await Order.countDocuments()
        const totalCategories = await Category.countDocuments()

        // Get revenue statistics
        const orders = await Order.find({ status: { $ne: "cancelled" } })
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)

        // Get recent orders
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("userId", "name email")

        // Get low stock products
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
            .sort({ stock: 1 })
            .limit(5)

        // Get order status distribution
        const pendingOrders = await Order.countDocuments({ status: "pending" })
        const processingOrders = await Order.countDocuments({ status: "processing" })
        const shippedOrders = await Order.countDocuments({ status: "shipped" })
        const deliveredOrders = await Order.countDocuments({ status: "delivered" })
        const cancelledOrders = await Order.countDocuments({ status: "cancelled" })

        res.json({
            totalUsers,
            totalProducts,
            totalOrders,
            totalCategories,
            totalRevenue,
            recentOrders,
            lowStockProducts,
            orderStatusDistribution: {
                pending: pendingOrders,
                processing: processingOrders,
                shipped: shippedOrders,
                delivered: deliveredOrders,
                cancelled: cancelledOrders,
            },
        })
    } catch (error) {
        console.error("Error fetching dashboard data:", error)
        res.status(500).json({ message: "Error fetching dashboard data" })
    }
})

// User management routes
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 })
        res.json(users)
    } catch (error) {
        console.error("Error fetching users:", error)
        res.status(500).json({ message: "Error fetching users" })
    }
})

router.get("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        res.json(user)
    } catch (error) {
        console.error("Error fetching user:", error)
        res.status(500).json({ message: "Error fetching user" })
    }
})

router.put("/users/:id", async (req, res) => {
    try {
        const { name, email, role } = req.body

        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Update user fields
        if (name) user.name = name
        if (email) user.email = email
        if (role) user.role = role

        await user.save()

        res.json({ message: "User updated successfully", user })
    } catch (error) {
        console.error("Error updating user:", error)
        res.status(500).json({ message: "Error updating user" })
    }
})

router.delete("/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        await User.findByIdAndDelete(req.params.id)

        res.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("Error deleting user:", error)
        res.status(500).json({ message: "Error deleting user" })
    }
})

// Product management routes
router.get("/products", async (req, res) => {
    try {
        const products = await Product.find()
            .populate("majorCategory", "name")
            .populate("subCategory", "name")
            .sort({ createdAt: -1 })

        res.json(products)
    } catch (error) {
        console.error("Error fetching products:", error)
        res.status(500).json({ message: "Error fetching products" })
    }
})

router.post("/products", async (req, res) => {
    try {
        const { name, description, price, stock, imageUrl, majorCategory, subCategory, isBestseller } = req.body

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            imageUrl,
            majorCategory,
            subCategory,
            isBestseller: isBestseller || false,
        })

        await newProduct.save()

        res.status(201).json({ message: "Product created successfully", product: newProduct })
    } catch (error) {
        console.error("Error creating product:", error)
        res.status(500).json({ message: "Error creating product" })
    }
})

router.get("/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("majorCategory", "name")
            .populate("subCategory", "name")

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.json(product)
    } catch (error) {
        console.error("Error fetching product:", error)
        res.status(500).json({ message: "Error fetching product" })
    }
})

router.put("/products/:id", async (req, res) => {
    try {
        const { name, description, price, stock, imageUrl, majorCategory, subCategory, isBestseller } = req.body

        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        // Update product fields
        if (name) product.name = name
        if (description) product.description = description
        if (price !== undefined) product.price = price
        if (stock !== undefined) product.stock = stock
        if (imageUrl) product.imageUrl = imageUrl
        if (majorCategory) product.majorCategory = majorCategory
        if (subCategory) product.subCategory = subCategory
        if (isBestseller !== undefined) product.isBestseller = isBestseller

        await product.save()

        res.json({ message: "Product updated successfully", product })
    } catch (error) {
        console.error("Error updating product:", error)
        res.status(500).json({ message: "Error updating product" })
    }
})

router.delete("/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        await Product.findByIdAndDelete(req.params.id)

        res.json({ message: "Product deleted successfully" })
    } catch (error) {
        console.error("Error deleting product:", error)
        res.status(500).json({ message: "Error deleting product" })
    }
})

// Category management routes
router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 })
        res.json(categories)
    } catch (error) {
        console.error("Error fetching categories:", error)
        res.status(500).json({ message: "Error fetching categories" })
    }
})

router.post("/categories", async (req, res) => {
    try {
        const { name, description } = req.body

        const existingCategory = await Category.findOne({ name })
        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" })
        }

        const newCategory = new Category({ name, description })
        await newCategory.save()

        res.status(201).json({ message: "Category created successfully", category: newCategory })
    } catch (error) {
        console.error("Error creating category:", error)
        res.status(500).json({ message: "Error creating category" })
    }
})

router.put("/categories/:id", async (req, res) => {
    try {
        const { name, description } = req.body

        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }

        // Check if updated name already exists
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name })
            if (existingCategory) {
                return res.status(400).json({ message: "Category name already exists" })
            }
            category.name = name
        }

        if (description) category.description = description

        await category.save()

        res.json({ message: "Category updated successfully", category })
    } catch (error) {
        console.error("Error updating category:", error)
        res.status(500).json({ message: "Error updating category" })
    }
})

router.delete("/categories/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ message: "Category not found" })
        }

        // Check if category is being used by products
        const productsUsingCategory = await Product.countDocuments({ majorCategory: req.params.id })
        if (productsUsingCategory > 0) {
            return res.status(400).json({
                message: "Cannot delete category as it is being used by products",
                productsCount: productsUsingCategory,
            })
        }

        // Check if category is being used by subcategories
        const subCategoriesUsingCategory = await SubCategory.countDocuments({ majorCategory: req.params.id })
        if (subCategoriesUsingCategory > 0) {
            return res.status(400).json({
                message: "Cannot delete category as it is being used by subcategories",
                subCategoriesCount: subCategoriesUsingCategory,
            })
        }

        await Category.findByIdAndDelete(req.params.id)

        res.json({ message: "Category deleted successfully" })
    } catch (error) {
        console.error("Error deleting category:", error)
        res.status(500).json({ message: "Error deleting category" })
    }
})

// Subcategory management routes
router.get("/subcategories", async (req, res) => {
    try {
        const subcategories = await SubCategory.find().populate("majorCategory", "name").sort({ name: 1 })

        res.json(subcategories)
    } catch (error) {
        console.error("Error fetching subcategories:", error)
        res.status(500).json({ message: "Error fetching subcategories" })
    }
})

router.post("/subcategories", async (req, res) => {
    try {
        const { name, description, majorCategory } = req.body

        // Check if major category exists
        const categoryExists = await Category.findById(majorCategory)
        if (!categoryExists) {
            return res.status(400).json({ message: "Major category not found" })
        }

        // Check if subcategory already exists
        const existingSubCategory = await SubCategory.findOne({ name })
        if (existingSubCategory) {
            return res.status(400).json({ message: "Subcategory already exists" })
        }

        const newSubCategory = new SubCategory({ name, description, majorCategory })
        await newSubCategory.save()

        res.status(201).json({ message: "Subcategory created successfully", subCategory: newSubCategory })
    } catch (error) {
        console.error("Error creating subcategory:", error)
        res.status(500).json({ message: "Error creating subcategory" })
    }
})

router.put("/subcategories/:id", async (req, res) => {
    try {
        const { name, description, majorCategory } = req.body

        const subCategory = await SubCategory.findById(req.params.id)
        if (!subCategory) {
            return res.status(404).json({ message: "Subcategory not found" })
        }

        // Check if updated name already exists
        if (name && name !== subCategory.name) {
            const existingSubCategory = await SubCategory.findOne({ name })
            if (existingSubCategory) {
                return res.status(400).json({ message: "Subcategory name already exists" })
            }
            subCategory.name = name
        }

        if (description) subCategory.description = description

        if (majorCategory) {
            // Check if major category exists
            const categoryExists = await Category.findById(majorCategory)
            if (!categoryExists) {
                return res.status(400).json({ message: "Major category not found" })
            }
            subCategory.majorCategory = majorCategory
        }

        await subCategory.save()

        res.json({ message: "Subcategory updated successfully", subCategory })
    } catch (error) {
        console.error("Error updating subcategory:", error)
        res.status(500).json({ message: "Error updating subcategory" })
    }
})

router.delete("/subcategories/:id", async (req, res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id)
        if (!subCategory) {
            return res.status(404).json({ message: "Subcategory not found" })
        }

        // Check if subcategory is being used by products
        const productsUsingSubCategory = await Product.countDocuments({ subCategory: req.params.id })
        if (productsUsingSubCategory > 0) {
            return res.status(400).json({
                message: "Cannot delete subcategory as it is being used by products",
                productsCount: productsUsingSubCategory,
            })
        }

        await SubCategory.findByIdAndDelete(req.params.id)

        res.json({ message: "Subcategory deleted successfully" })
    } catch (error) {
        console.error("Error deleting subcategory:", error)
        res.status(500).json({ message: "Error deleting subcategory" })
    }
})

// Order management routes
router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("userId", "name email")
            .populate("products.productId", "name price")
            .sort({ createdAt: -1 })

        res.json(orders)
    } catch (error) {
        console.error("Error fetching orders:", error)
        res.status(500).json({ message: "Error fetching orders" })
    }
})

router.get("/orders/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("userId", "name email")
            .populate("products.productId", "name price imageUrl")

        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        res.json(order)
    } catch (error) {
        console.error("Error fetching order:", error)
        res.status(500).json({ message: "Error fetching order" })
    }
})

router.put("/orders/:id", async (req, res) => {
    try {
        const { status, trackingNumber } = req.body

        const order = await Order.findById(req.params.id)
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        // Update order fields
        if (status) {
            // If changing from delivered to another status, check if products need to be restocked
            if (order.status === "delivered" && status !== "delivered") {
                // Restock products
                for (const item of order.products) {
                    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
                }
            }

            // If changing to delivered from another status, update payment status
            if (status === "delivered" && order.status !== "delivered") {
                order.paymentStatus = "completed"
            }

            // If changing to cancelled, restock products
            if (status === "cancelled" && order.status !== "cancelled") {
                // Restock products
                for (const item of order.products) {
                    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
                }

                // Update payment status
                if (order.paymentStatus === "completed") {
                    order.paymentStatus = "refunded"
                } else {
                    order.paymentStatus = "cancelled"
                }
            }

            order.status = status
        }

        if (trackingNumber) {
            order.trackingNumber = trackingNumber
        }

        await order.save()

        res.json({ message: "Order updated successfully", order })
    } catch (error) {
        console.error("Error updating order:", error)
        res.status(500).json({ message: "Error updating order" })
    }
})

export default router

