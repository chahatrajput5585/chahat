import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  // Extract token from headers or cookies based on your setup
  const token = req.headers.authorization || req.cookies.token;

  if (!token) {
    return next(new ErrorHandler("User Not Authorized", 401));
  }

  try {
    // Verify the token and extract user ID
    const decoded = jwt.verify(token, "bO7ElGE70z2gNaJvh2dckVKvKZw");
    
    // Find user by ID from the database
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Attach user object to request for further processing
    req.user = user;

    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid token", 401));
  }
});
