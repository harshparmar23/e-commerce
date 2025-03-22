import express from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();


router.post("/add", async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid ObjectId" });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, products: [{ productId, quantity }] });
        } else {
            let productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);

            if (productIndex !== -1) {
                cart.products[productIndex].quantity += quantity; // Increase quantity if product exists
            } else {
                cart.products.push({ productId, quantity });
            }
        }

        await cart.save();
        res.status(200).json({ message: "Product added to cart", cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🛒 Fetch Cart for a User
router.get("/:userId", async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate("products.productId");
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ➕ Increase Product Quantity
router.put("/increase/:userId/:productId", async (req, res) => {
    try {
        const { userId, productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid ObjectId" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        let productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
        if (productIndex === -1) return res.status(400).json({ error: "Product not in cart" });

        if (cart.products[productIndex].quantity >= product.stock) {
            return res.status(400).json({ error: `We do not have more of "${product.name}" in stock.` });
        }

        cart.products[productIndex].quantity += 1;
        await cart.save();

        res.status(200).json({ message: "Quantity increased", cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// ➖ Decrease Product Quantity
router.put("/decrease/:userId/:productId", async (req, res) => {
    try {
        const { userId, productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ error: "Invalid ObjectId" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        let productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
        if (productIndex === -1) return res.status(400).json({ error: "Product not in cart" });

        if (cart.products[productIndex].quantity === 1) {
            cart.products.splice(productIndex, 1); // Remove product if quantity is 1
        } else {
            cart.products[productIndex].quantity -= 1;
        }

        await cart.save();

        res.status(200).json({ message: "Quantity decreased", cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:userId/:productId", async (req, res) => {
    try {
        const { userId, productId } = req.params;
        await Cart.updateOne(
            { userId },
            { $pull: { products: { "productId": productId } } }
        );
        res.status(200).json({ message: "Product removed from cart" });
    } catch (error) {
        res.status(500).json({ error: "Error removing product from cart" });
    }
});

// Clear the entire cart
router.delete("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        await Cart.findOneAndUpdate(
            { userId },
            { $set: { products: [] } },
            { new: true }
        );
        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error clearing cart" });
    }
});

export default router;
