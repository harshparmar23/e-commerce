import mongoose from "mongoose"

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        majorCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
    },
    { timestamps: true },
)

const SubCategory = mongoose.model("SubCategory", subCategorySchema)

export default SubCategory

