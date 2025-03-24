import express from "express"
import Settings from "../models/Settings.js"
import adminMiddleware from "../middleware/adminMiddleware.js"

const router = express.Router()

// Get all settings (public)
router.get("/", async (req, res) => {
    try {
        const settings = await Settings.getSingleton()
        res.json(settings)
    } catch (error) {
        console.error("Error fetching settings:", error)
        res.status(500).json({ message: "Error fetching settings" })
    }
})

// Update settings (admin only)
router.put("/", adminMiddleware, async (req, res) => {
    try {
        const settings = await Settings.getSingleton()

        // Update fields from request body
        const updatableFields = [
            "siteName",
            "siteDescription",
            "contactEmail",
            "enableRegistration",
            "enableGuestCheckout",
            "maintenanceMode",
            "maintenanceMessage",
            "defaultCurrency",
            "shippingFee",
            "freeShippingThreshold",
        ]

        updatableFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field]
            }
        })

        // Set currency symbol based on currency
        if (req.body.defaultCurrency) {
            switch (req.body.defaultCurrency) {
                case "USD":
                    settings.currencySymbol = "$"
                    break
                case "EUR":
                    settings.currencySymbol = "€"
                    break
                case "GBP":
                    settings.currencySymbol = "£"
                    break
                case "INR":
                default:
                    settings.currencySymbol = "₹"
                    break
            }
        }

        await settings.save()
        res.json({ message: "Settings updated successfully", settings })
    } catch (error) {
        console.error("Error updating settings:", error)
        res.status(500).json({ message: "Error updating settings" })
    }
})

export default router

