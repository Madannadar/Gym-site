import { verifyAccessToken } from "../utils/jwt.util.js";

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authorization token required",
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
        isExpired: true,
      });
    }
    return res.status(403).json({
      success: false,
      error: "Invalid token",
    });
  }
}

export default authenticate;
