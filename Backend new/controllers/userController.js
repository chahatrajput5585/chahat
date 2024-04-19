import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { decryptToken, sendToken } from "../utils/jwtToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });
  sendToken(user, 201, res, "User Registered!");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  console.log(email, password, role);
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password, and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  console.log("is password matched", isPasswordMatched);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and ${role} not found!`, 404)
    );
  }
  sendToken(user, 201, res, "User Logged In!");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  try {
    res
      .status(201)
      .cookie("token", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
      })
      .json({
        success: true,
        message: "Logged Out Successfully.",
      });
  } catch (error) {
    return next(new ErrorHandler("Logout failed", 500));
  }
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  try {
    // Decrypt the token asynchronously
    const token = req.headers.authorization || req.cookies.token;

    if (!token) {
      return next(new ErrorHandler("User not authorized", 401));
    }

    const user = await decryptToken(token);

    if (!user) {
      return next(new ErrorHandler("Invalid token", 401));
    }

    res.status(200).json({
      success: true,
      data: { ...user },
    });
  } catch (error) {
    console.log("Error====>", error);
    return next(new ErrorHandler("Internal server error", 500));
  }
});

