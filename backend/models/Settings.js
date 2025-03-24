import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema(
    {
        siteName: {
            type: String,
            required: true,
            default: "ShopApp",
        },
        siteDescription: {
            type: String,
            default: "Your one-stop e-commerce solution",
        },
        contactEmail: {
            type: String,
            default: "support@shopapp.com",
        },
        enableRegistration: {
            type: Boolean,
            default: true,
        },
        enableGuestCheckout: {
            type: Boolean,
            default: false,
        },
        maintenanceMode: {
            type: Boolean,
            default: false,
        },
        maintenanceMessage: {
            type: String,
            default: "We're currently performing maintenance. Please check back soon!",
        },
        defaultCurrency: {
            type: String,
            enum: ["INR", "USD", "EUR", "GBP"],
            default: "INR",
        },
        currencySymbol: {
            type: String,
            default: "₹",
        },
        shippingFee: {
            type: Number,
            default: 0,
        },
        freeShippingThreshold: {
            type: Number,
            default: 1000,
        },
    },
    { timestamps: true },
)

// Ensure there's only one settings document by using a singleton pattern
settingsSchema.statics.getSingleton = async function () {
    const count = await this.countDocuments()
    if (count === 0) {
        return await this.create({})
    }

    return await this.findOne()
}

const Settings = mongoose.model("Settings", settingsSchema)

export default Settings

