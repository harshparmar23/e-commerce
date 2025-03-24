import Settings from "../models/Settings.js"
import jwt from "jsonwebtoken"

const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Skip maintenance check for admin routes, the settings route, and login route
        if (
            req.path.startsWith("/api/admin") ||
            req.path === "/api/settings" ||
            req.path === "/api/auth/login" ||
            req.path === "/api/auth/me"
        ) {
            return next()
        }

        const settings = await Settings.getSingleton()

        // If maintenance mode is not enabled, proceed normally
        if (!settings.maintenanceMode) {
            return next()
        }

        // Check if user is an admin
        const token =
            req.cookies.token ||
            (req.headers.authorization && req.headers.authorization.startsWith("Bearer")
                ? req.headers.authorization.split(" ")[1]
                : null)

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
                if (decoded.role === "admin") {
                    // Allow admins to bypass maintenance mode
                    return next()
                }
            } catch (err) {
                // Token verification failed, continue with maintenance check
                console.error("Token verification failed:", err.message)
            }
        }

        // Return maintenance mode response for non-admin users
        return res.status(503).json({
            maintenance: true,
            message: settings.maintenanceMessage || "Site is under maintenance. Please check back later.",
        })
    } catch (error) {
        console.error("Maintenance middleware error:", error)
        next() // Proceed anyway in case of error
    }
}

export default maintenanceMiddleware

