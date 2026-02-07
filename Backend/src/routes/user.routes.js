import { Router } from "express";
import {
    userRegister,
    userLogin,
    userLogout,
    changeCurrentPassword,
    refreshAccessToken,
    getCurrentUser,
    getAllUsers
} from "../controllers/user.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js";
import { authRateLimiter, generalRateLimiter } from "../middleware/rateLimiter.middleware.js";
import { sanitizeInputMiddleware, validatePagination } from "../middleware/validation.middleware.js";

const userRouter = Router();

// Apply input sanitization to all routes
userRouter.use(sanitizeInputMiddleware);

// Public routes with stricter rate limiting
userRouter.route("/register").post(authRateLimiter, userRegister);
userRouter.route("/login").post(authRateLimiter, userLogin);

// Protected routes with general rate limiting
userRouter.route("/current").get(verifyToken, generalRateLimiter, getCurrentUser);
userRouter.route("/all").get(verifyToken, generalRateLimiter, validatePagination, getAllUsers);
userRouter.route("/Logout").post(verifyToken, generalRateLimiter, userLogout);
userRouter.route("/changePassword").post(verifyToken, generalRateLimiter, changeCurrentPassword);
userRouter.route("/refresh-token").post(authRateLimiter, refreshAccessToken);

export default userRouter;
