import jwt from "jsonwebtoken"

const adminMiddleware = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token =
            req.cookies.token ||
            (req.headers.authorization && req.headers.authorization.startsWith("Bearer")
                ? req.headers.authorization.split(" ")[1]
                : null)

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Store userId in request
            req.userId = decoded.userId
            req.userRole = decoded.role

            // Check if user is admin
            if (decoded.role !== "admin") {
                return res.status(403).json({ message: "Forbidden: Admin access required" })
            }

            next()
        } catch (err) {
            console.error("Token verification failed:", err.message)
            res.status(401).json({ message: "Invalid or expired token" })
        }
    } catch (error) {
        console.error("Admin middleware error:", error)
        res.status(500).json({ message: "Server error in authentication" })
    }
}

export default adminMiddleware

