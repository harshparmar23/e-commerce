import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
        isBestseller: {
            type: Boolean,
            default: false,
        },
        avgRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        majorCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },
    },
    { timestamps: true },
)

const Product = mongoose.model("Product", productSchema)

export default Product

