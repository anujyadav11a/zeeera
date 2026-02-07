import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/apiResponse.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "user not found")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "internal server error")
    }
}

const createDefaultadmin = async () => {
    try {
        const existingAdmin = await User.findOne({ role: "admin" })
        if (!existingAdmin) {
            // Use environment variable for admin password or generate a secure one
            const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123!SecureDefault";
            const hasPassword = await bcrypt.hash(adminPassword, 12); // Increased salt rounds

            await User.create({
                password: hasPassword,
                email: process.env.DEFAULT_ADMIN_EMAIL || "admin@zeera.com",
                name: "System Admin",
                role: "admin"
            })
            
            console.log("Default admin created. Please change the password immediately.");
        }
    } catch (error) {
        console.error("Error creating default admin:", error);
        throw new ApiError(500, "internal server error")
    }
}

const userRegister = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    // Enhanced validation
    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are required")
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "invalid email format");
    }

    // Password strength validation
    if (password.length < 8) {
        throw new ApiError(400, "password must be at least 8 characters long");
    }

    // Check for existing user (case-insensitive email)
    const userExist = await User.findOne({ 
        email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    if (userExist) {
        throw new ApiError(409, "user already exist with this email")
    }

    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password
    })

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "user registration failed, please try again")
    }

    return res.status(201)
        .json(new ApiResponse(201, createdUser, "user registered successfully"))
})

const userLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "email and password are required")
    }

    // Case-insensitive email lookup
    const user = await User.findOne({ 
        email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    if (!user) {
        throw new ApiError(401, "invalid credentials") // Don't reveal if user exists
    }

    const isPasswordvalid = await user.comparePassword(password)
    if (!isPasswordvalid) {
        throw new ApiError(401, "invalid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id)

    const LoggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const Option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
    
    return res.status(200)
        .cookie("refreshToken", refreshToken, Option)
        .cookie("accessToken", accessToken, Option)
        .json(
            new ApiResponse(200, {
                user: LoggedinUser,
                token: accessToken
            }, "user logged in successfully")
        )
})

const userLogout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // Use $unset instead of setting to undefined
            }
        },
        {
            new: true
        }
    )

    const Option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }

    return res.status(200)
        .clearCookie("refreshToken", Option)
        .clearCookie("accessToken", Option)
        .json(
            new ApiResponse(200, {}, "user logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken // Fixed typo: req.cookie -> req.cookies

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorised request")
    }

    try {
        const DecodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(DecodedToken?._id)

        if (!user) {
            throw new ApiError(401, "invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used")
        }

        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessandRefreshToken(user._id)

        return res.status(200)
            .cookie("refreshToken", newRefreshToken, option)
            .cookie("accessToken", accessToken, option)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldpassword, newpassword } = req.body
    
    if (!oldpassword || !newpassword) {
        throw new ApiError(400, "old password and new password are required");
    }

    // Password strength validation
    if (newpassword.length < 8) {
        throw new ApiError(400, "new password must be at least 8 characters long");
    }

    if (oldpassword === newpassword) {
        throw new ApiError(400, "new password must be different from old password");
    }

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.comparePassword(oldpassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "invalid old password")
    }

    user.password = newpassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Current user fetched successfully")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
    // Add pagination and filtering for security
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 users per request
    const skip = (page - 1) * limit;

    // Only return active users and exclude sensitive fields
    const users = await User.find({ 
        isActive: { $ne: false } // Only active users
    })
    .select('_id name email role createdAt') // Only necessary fields
    .sort({ name: 1 }) // Sort by name
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await User.countDocuments({ isActive: { $ne: false } });
    
    return res.status(200).json(
        new ApiResponse(200, {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, "Users fetched successfully")
    );
});

export {
    userRegister,
    createDefaultadmin,
    userLogin,
    userLogout,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getAllUsers
}