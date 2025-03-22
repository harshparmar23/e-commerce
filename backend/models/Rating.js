import mongoose from "mongoose"

const ratingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            default: "",
        },
    },
    { timestamps: true },
)

// Compound index to ensure a user can only rate a product once per order
ratingSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true })

const Rating = mongoose.model("Rating", ratingSchema)

export default Rating

