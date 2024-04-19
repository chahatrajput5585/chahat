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
  console.log(email,password,role);
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email ,password and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  console.log("is password matched",isPasswordMatched);
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
});


export const getUser = catchAsyncErrors(async (req, res, next) => {
  try {
    // Verify user and then send details to the response.
    const token = req.headers.authorization || req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    const user = await decryptToken(token); // Assuming decryptToken returns a Promise
    if (!user) {
      // If user is not found or authentication fails, handle appropriately
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }
    
    // If user is found, send user details in the response
    res.status(200).json({
      success: true,
      data: { ...user },
    });
  } catch (error) {
    // If an error occurs during user retrieval or processing, handle it
    console.log("Error====>", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
