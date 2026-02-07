import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyToken = asyncHandler(async (req, res, next) => {
    try {
        const Token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "");
    
        if (!Token) {
            throw new ApiError(401, "unauthorized access, no token provided")
        }

        // Verify token with proper error handling
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
    
        // Check if user still exists and is active
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "unauthorized access, user not found")
        }

        // Check if user is active (if you have an isActive field)
        if (user.isActive === false) {
            throw new ApiError(401, "unauthorized access, account deactivated")
        }

        req.user = user
        next()
    
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, "unauthorized access, invalid token")
        } else if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, "unauthorized access, token expired")
        } else if (error.name === 'NotBeforeError') {
            throw new ApiError(401, "unauthorized access, token not active")
        }
        
        throw new ApiError(401, error?.message || "unauthorized access")
    }
})

export { verifyToken }