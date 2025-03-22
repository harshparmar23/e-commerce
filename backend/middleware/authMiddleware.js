import jwt from "jsonwebtoken"

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token =
            req.cookies.token ||
            (req.headers.authorization && req.headers.authorization.startsWith("Bearer")
                ? req.headers.authorization.split(" ")[1]
                : null)

        console.log("Token received:", token ? "Token exists" : "No token")

        if (!token) {
            console.log("No token found in request")
            return res.status(401).json({ message: "Unauthorized: No token provided" })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            console.log("Token decoded successfully, userId:", decoded.userId)

            // Store userId in request
            req.userId = decoded.userId
            req.userRole = decoded.role

            next()
        } catch (err) {
            console.error("Token verification failed:", err.message)
            res.status(401).json({ message: "Invalid or expired token" })
        }
    } catch (error) {
        console.error("Auth middleware error:", error)
        res.status(500).json({ message: "Server error in authentication" })
    }
}

export default authMiddleware

