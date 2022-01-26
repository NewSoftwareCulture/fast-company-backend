const UserModel = require('../models/UserModel');
const tokenService = require('../services/token.service');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  try {
    const [, token] = req.headers.authorization.split(' ');

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const data = tokenService.validateAccess(token);

    req.user = data;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}