const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authorization = req.header('Authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Your session is invalid or has expired. Please sign in again.' });
  }
};

module.exports = authMiddleware;
