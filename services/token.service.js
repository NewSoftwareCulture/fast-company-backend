const jwt = require('jsonwebtoken');
const config = require('config');

const TokenModel = require('../models/TokenModel');

class TokenService {
  generate(payload) {
    const accessToken = jwt.sign(payload, config.get('JWT_ACCESS'), {
      expiresIn: '1h'
    });

    const refreshToken = jwt.sign(payload, config.get('JWT_REFRESH'));

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600
    }
  }

  async save(user, refreshToken) {
    const data = await TokenModel.findOne({ user });

    if (data) {
      data.refreshToken = refreshToken;
      return data.save();
    }

    const token = await TokenModel.create({ user, refreshToken })
    return token;
  }

  findOne(refreshToken) {
    try {
      return TokenModel.findOne({ refreshToken }).lean();
    } catch (error) {
      return null;
    }
  }

  validateRefresh(refreshToken) {
    try {
      return jwt.verify(refreshToken, config.get('JWT_REFRESH'));
    } catch (error) {
      return null;
    }
  }

  validateAccess(accessToken) {
    try {
      return jwt.verify(accessToken, config.get('JWT_ACCESS'));
    } catch (error) {
      return null;
    }
  }
}

module.exports = new TokenService();