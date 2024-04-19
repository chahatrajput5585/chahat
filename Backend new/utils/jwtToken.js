import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, res, message) => {
  const payload = { user: user.name, email: user.email, role: user.role };

  try {
    const token = jwt.sign(payload, "bO7ElGE70z2gNaJvh2dckVKvKZw", {
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
    const payload = jwt.verify(token, "bO7ElGE70z2gNaJvh2dckVKvKZw");
    return payload;
  } catch (error) {
    console.error("Error while decrypting token:", error);
    return null; // Return null or handle the error appropriately
  }
};

