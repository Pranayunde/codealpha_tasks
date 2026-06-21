const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'shop-app-dev-secret-change-in-production';

function authRequired(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.clearCookie('token');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function authOptional(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      res.clearCookie('token');
    }
  }
  next();
}

module.exports = { authRequired, authOptional, JWT_SECRET };
