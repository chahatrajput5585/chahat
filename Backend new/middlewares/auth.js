import JWT from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    next("Auth Failed");
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = JWT.verify(token, "bO7ElGE70z2gNaJvh2dckVKvKZw");
    req.user = { id: payload.id };
    next();
  } catch (error) {
    next("Auth Failed");
  }
};

export default isAuthenticated;
