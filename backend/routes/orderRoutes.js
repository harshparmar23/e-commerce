import express from "express"
import mongoose from "mongoose"
import Order from "../models/Order.js"
import Cart from "../models/Cart.js"
import User from "../models/User.js"
import Product from "../models/Product.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// Create a new order
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { addressId, isGift, giftMessage, paymentMethod = "cash_on_delivery" } = req.body

        const userId = req.userId

        // Validate user exists
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Find user's cart
        const cart = await Cart.findOne({ userId }).populate("products.productId")
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ error: "Cart is empty" })
        }

        // Find the selected address
        const selectedAddress = user.addresses.find((addr) => addr._id.toString() === addressId)

        if (!selectedAddress) {
            return res.status(404).json({ error: "Selected address not found" })
        }

        // Check product stock and calculate total amount
        const orderProducts = []
        let totalAmount = 0

        for (const item of cart.products) {
            const product = await Product.findById(item.productId._id)

            if (!product) {
                return res.status(404).json({ error: `Product not found: ${item.productId._id}` })
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Not enough stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
                })
            }

            // Reduce product stock
            product.stock -= item.quantity
            await product.save()

            orderProducts.push({
                productId: product._id,
                quantity: item.quantity,
                price: product.price,
            })

            totalAmount += product.price * item.quantity
        }

        // Create new order
        const newOrder = new Order({
            userId,
            products: orderProducts,
            shippingAddress: {
                street: selectedAddress.street,
                city: selectedAddress.city,
                state: selectedAddress.state,
                country: selectedAddress.country,
                zipCode: selectedAddress.zipCode,
            },
            totalAmount,
            isGift: isGift || false,
            giftMessage: giftMessage || "",
            paymentMethod,
        })

        await newOrder.save()

        // Clear the user's cart
        await Cart.findOneAndUpdate({ userId }, { $set: { products: [] } })

        res.status(201).json({
            message: "Order created successfully",
            orderId: newOrder._id,
        })
    } catch (error) {
        console.error("Error creating order:", error)
        res.status(500).json({ error: "Failed to create order" })
    }
})

// Get all orders for a user
router.get("/user", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId

        console.log(`Fetching orders for user: ${userId}`)

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" })
        }

        const orders = await Order.find({ userId }).populate("products.productId").sort({ createdAt: -1 })

        console.log(`Found ${orders.length} orders for user ${userId}`)

        res.json(orders)
    } catch (error) {
        console.error("Error fetching orders:", error)
        res.status(500).json({ error: "Failed to fetch orders" })
    }
})

// Get a specific order by ID
router.get("/:orderId", authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params
        const userId = req.userId

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: "Invalid order ID" })
        }

        const order = await Order.findById(orderId).populate("products.productId")

        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        // Ensure user can only access their own orders
        if (order.userId.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized access to this order" })
        }

        res.json(order)
    } catch (error) {
        console.error("Error fetching order:", error)
        res.status(500).json({ error: "Failed to fetch order" })
    }
})

// Cancel an order
router.put("/:orderId/cancel", authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params
        const userId = req.userId

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: "Invalid order ID" })
        }

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        // Ensure user can only cancel their own orders
        if (order.userId.toString() !== userId) {
            return res.status(403).json({ error: "Unauthorized access to this order" })
        }

        // Only allow cancellation if order is pending or processing
        if (order.status !== "pending" && order.status !== "processing") {
            return res.status(400).json({
                error: "Cannot cancel order that has been shipped or delivered",
            })
        }

        // Restore product stock
        for (const item of order.products) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
        }

        order.status = "cancelled"
        await order.save()

        res.json({ message: "Order cancelled successfully", order })
    } catch (error) {
        console.error("Error cancelling order:", error)
        res.status(500).json({ error: "Failed to cancel order" })
    }
})

export default router

