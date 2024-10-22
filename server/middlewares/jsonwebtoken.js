const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../constants');

// Middleware
const authorizeBearerToken = (req, res, next) => {
  try {
    // Extract token 
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ message: 'Unauthorized - Invalid token.' });
  }
};

// New JWT token
const signToken = (payload = {}, expiresIn = '12h') => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
  return token;
};

module.exports = {
  authorizeBearerToken,
  signToken,
};
