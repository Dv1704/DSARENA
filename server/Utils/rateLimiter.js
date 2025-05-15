const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
      });
    },
  });
};

module.exports = {
  createLimiter,
};