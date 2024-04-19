import jwt from "jsonwebtoken";

export const sendToken = (user, res, statusCode = 200, message = "Token generated successfully") => {
  const payload = { user: user.name, email: user.email, role: user.role };

  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: '1h'
    });

    res.status(statusCode).cookie("token", token).json({
      success: true,
      message,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Error while signing token:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const decryptToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    return payload;
  } catch (error) {
    console.error("Error while decrypting token:", error);
    return null; // Return null or handle the error appropriately
  }
};

