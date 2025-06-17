
import { verifyAccessToken } from '../utils/jwt.util.js';

function authenticate(req, res, next) {
  console.log('🔍 Authenticate Middleware: Checking Authorization header');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log(`🔍 Token: ${token ? 'Present' : 'Missing'}`);


  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      console.log(`✅ Decoded Token: ${JSON.stringify(decoded)}`);
      req.user = decoded;
      return next();
    } catch (error) {

      console.error(`❌ Token Error: ${error.name} - ${error.message}`);
      if (error.name === 'TokenExpiredError') {

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

  console.log('🔍 Checking Passport session');
  if (req.isAuthenticated()) {
    console.log('✅ Passport session authenticated');
    req.user = {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
    };
    return next();
  }

  console.error('❌ No token or session found');
  return res.status(401).json({
    success: false,
    error: "Authorization token or session required",
  });
}

export default authenticate;
