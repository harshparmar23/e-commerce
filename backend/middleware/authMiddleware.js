import jwt from "jsonwebtoken"

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token =
            req.cookies.token ||
            (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null)

        console.log("Auth check:", {
            hasCookieToken: !!req.cookies.token,
            hasHeaderToken: !!req.headers.authorization,
            userId: req.userId || "Not set",
        })

        if (!token) {
            console.log("No token found in request")
            return res.status(401).json({ message: "Unauthorized: No token provided" })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Store userId in request
            req.userId = decoded.userId
            req.userRole = decoded.role

            // Check if token is about to expire (if it expires in less than 1 day)
            const currentTime = Math.floor(Date.now() / 1000)
            if (decoded.exp - currentTime < 86400) {
                // Create a new token with extended expiration
                const newToken = jwt.sign({ userId: decoded.userId, role: decoded.role }, process.env.JWT_SECRET, {
                    expiresIn: "7d",
                })

                // Set the new token in the response
                res.cookie("token", newToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                })

                if (req.headers.authorization) {
                    res.setHeader("New-Auth-Token", newToken)
                }
            }

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
