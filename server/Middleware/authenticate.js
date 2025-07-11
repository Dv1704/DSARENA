const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.cookies?.token; // ✅ Get token from cookies

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authenticate;
