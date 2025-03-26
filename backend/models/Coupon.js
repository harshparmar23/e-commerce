import mongoose from "mongoose"

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Coupon description is required"],
        },
        discountType: {
            type: String,
            enum: ["fixed", "percentage", "dynamic"],
            default: "fixed",
        },
        discountAmount: {
            type: Number,
            required: function () {
                return this.discountType !== "dynamic"
            },
            min: 0,
        },
        minimumAmount: {
            type: Number,
            required: [true, "Minimum order amount is required"],
            default: 0,
            min: 0,
        },
        usageLimit: {
            type: Number,
            required: [true, "Usage limit is required"],
            min: 1,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        active: {
            type: Boolean,
            default: true,
        },
        expiryDate: {
            type: Date,
            required: [true, "Expiry date is required"],
        },
    },
    { timestamps: true },
)

// Method to check if coupon is valid
couponSchema.methods.isValid = function (orderAmount) {
    // Check if coupon is active
    if (!this.active) {
        return { valid: false, message: "Coupon is inactive" }
    }

    // Check if coupon has expired
    if (new Date() > this.expiryDate) {
        return { valid: false, message: "Coupon has expired" }
    }

    // Check if coupon has reached usage limit
    if (this.usedCount >= this.usageLimit) {
        return { valid: false, message: "Coupon usage limit reached" }
    }

    // Check if order meets minimum amount
    if (orderAmount < this.minimumAmount) {
        return {
            valid: false,
            message: `Order must be at least $${this.minimumAmount} to use this coupon`,
        }
    }

    return { valid: true }
}

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (orderAmount) {
    let discountAmount = 0

    switch (this.discountType) {
        case "fixed":
            discountAmount = this.discountAmount
            break
        case "percentage":
            discountAmount = (orderAmount * this.discountAmount) / 100
            break
        case "dynamic":
            // For coupons like FLAT150, extract the number from the code
            if (this.code.startsWith("FLAT")) {
                const amountStr = this.code.substring(4)
                const amount = Number.parseInt(amountStr, 10)
                if (!isNaN(amount)) {
                    discountAmount = amount
                }
            }
            break
    }

    // Ensure discount doesn't exceed order amount
    return Math.min(discountAmount, orderAmount)
}

const Coupon = mongoose.model("Coupon", couponSchema)

export default Coupon

