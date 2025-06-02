import { verifyAccessToken } from '../utils/jwt.util.js';

function authenticate(req, res, next) {
  // Check JWT first
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          isExpired: true,
        });
      }
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
      });
    }
  }

  // Check Passport session
  if (req.isAuthenticated()) {
    req.user = {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
    };
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Authorization token or session required',
  });
}

export default authenticate;
