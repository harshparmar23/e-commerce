import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.js"
import productRoutes from "./routes/product.js"
import categoryRoutes from "./routes/category.js"
import subCategoryRoutes from "./routes/sub_category.js"
import cartRoutes from "./routes/cartRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import wishlistRoutes from "./routes/wishlistRoutes.js"
import ratingRoutes from "./routes/ratingRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import settingsRoutes from "./routes/settingsRoutes.js"
import maintenanceMiddleware from "./middleware/maintenanceMiddleware.js"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(cookieParser())

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed", err))

// Apply maintenance middleware to check for maintenance mode
app.use(maintenanceMiddleware)

// Add these headers for security
app.use((req, res, next) => {
  // Security headers
  res.setHeader("X-Content-Type-Options", "nosniff")
  res.setHeader("X-Frame-Options", "DENY")
  res.setHeader("X-XSS-Protection", "1; mode=block")
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

  // Allow the frontend to read the new auth token header
  res.setHeader("Access-Control-Expose-Headers", "New-Auth-Token")

  next()
})

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/subcategories", subCategoryRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/users", userRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/ratings", ratingRoutes)
app.use("/api/admin", adminRoutes) // Add admin routes
app.use("/api/settings", settingsRoutes) // Add settings routes

app.listen(5000, () => console.log("Server running on port 5000"))

