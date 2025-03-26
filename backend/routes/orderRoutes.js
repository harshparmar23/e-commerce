import express from "express"
import mongoose from "mongoose"
import Order from "../models/Order.js"
import Cart from "../models/Cart.js"
import User from "../models/User.js"
import Product from "../models/Product.js"
import authMiddleware from "../middleware/authMiddleware.js"
import Coupon from "../models/Coupon.js"

const router = express.Router()

// Create a new order
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { addressId, isGift, giftMessage, paymentMethod, couponCode } = req.body
        const userId = req.userId

        // Find user to get address
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Find address
        const address = user.addresses.id(addressId)
        if (!address) {
            return res.status(404).json({ error: "Address not found" })
        }

        // Get cart
        const cart = await Cart.findOne({ userId }).populate("products.productId")
        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ error: "Cart is empty" })
        }

        // Calculate subtotal
        let subtotal = 0
        const orderProducts = []

        for (const item of cart.products) {
            // Check if product exists and has enough stock
            const product = await Product.findById(item.productId._id)
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId.name} not found` })
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
                })
            }

            // Update product stock
            product.stock -= item.quantity
            await product.save()

            // Add to order products
            orderProducts.push({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price,
            })

            // Add to subtotal
            subtotal += item.productId.price * item.quantity
        }

        // Apply coupon if provided
        let discountAmount = 0
        let couponData = null

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() })

            if (!coupon) {
                return res.status(404).json({ error: "Invalid coupon code" })
            }

            // Validate coupon
            const validationResult = coupon.isValid(subtotal)
            if (!validationResult.valid) {
                return res.status(400).json({ error: validationResult.message })
            }

            // Calculate discount
            discountAmount = coupon.calculateDiscount(subtotal)

            // Update coupon usage count
            coupon.usedCount += 1
            await coupon.save()

            couponData = {
                code: coupon.code,
                discountAmount,
            }
        }

        // Calculate total amount
        const totalAmount = subtotal - discountAmount

        // Create order
        const order = new Order({
            userId,
            products: orderProducts,
            shippingAddress: {
                street: address.street,
                city: address.city,
                state: address.state,
                country: address.country,
                zipCode: address.zipCode,
            },
            subtotal,
            coupon: couponData,
            totalAmount,
            isGift: isGift || false,
            giftMessage: giftMessage || "",
            paymentMethod: paymentMethod || "cash_on_delivery",
        })

        await order.save()

        // Clear cart
        cart.products = []
        await cart.save()

        res.status(201).json(order)
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

// Delete an order (admin only)
router.delete("/:orderId", authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params
        const userId = req.userId
        const userRole = req.userRole

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: "Invalid order ID" })
        }

        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({ error: "Order not found" })
        }

        // Ensure only admin or the order owner can delete it
        if (order.userId.toString() !== userId && userRole !== "admin") {
            return res.status(403).json({ error: "Unauthorized access to this order" })
        }

        // Restore product stock for non-delivered orders
        if (order.status !== "delivered") {
            for (const item of order.products) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
            }
        }

        await Order.findByIdAndDelete(orderId)

        res.json({ message: "Order deleted successfully" })
    } catch (error) {
        console.error("Error deleting order:", error)
        res.status(500).json({ error: "Failed to delete order" })
    }
})

export default router

