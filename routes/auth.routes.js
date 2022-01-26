const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const tokenService = require('../services/token.service');
const { generateUserData } = require('../utils/generateUserData');
const UserModel = require('../models/UserModel');

const router = express.Router({ mergeParams: true });

const signUpValidations = [
  check('email', 'Некорректный email').isEmail(),
  check('email', 'Некорректный email').normalizeEmail().isEmail(),
  check('password', 'Пароль не может быть пустым').exists(),
  check('password', 'Минимальная длина пароля 8 символов').isLength({ min: 8 }),
];

router.post('/signUp', [
  ...signUpValidations,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            message: 'INVALID_DATA',
            code: 400
          }
        });
      }
      const { email, password, ...params } = req.body;
      const user = await UserModel.findOne({ email }).select('_id').lean();

      if (user) {
        return res.status(400).json({
          error: {
            message: 'EMAIL_EXISTS',
            code: 400
          } 
        })
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const { _id } = await UserModel.create({
        ...generateUserData(),
        ...req.body,
        password: hashedPassword,
      });

      const tokens = tokenService.generate({ _id });
      await tokenService.save(_id, tokens.refreshToken);

      return res.status(201).send({ ...tokens, userId: _id });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: 'На сервере произошла ошибка. Попробуйте позже'
      });
    }
  }
]);

router.post('/signInWithPassword', [
  ...signUpValidations,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: {
            message: 'INVALID_DATA',
            code: 400
          }
        });
      }

      const { email, password } = req.body;

      const user = await UserModel.findOne({ email }).select(['_id', 'password']).lean();

      if (!user) {
        return res.status(400).json({
          error: {
            message: 'EMAIL_NOT_FOUND',
            code: 400
          } 
        })
      }

      const isPasswordEqual = await bcrypt.compare(password, user.password);
      if (!isPasswordEqual) {
        return res.status(400).json({
          error: {
            message: 'INVALID_PASSWORD',
            code: 400
          } 
        })
      }

      const tokens = tokenService.generate({ _id: user._id });
      await tokenService.save(user._id, tokens.refreshToken);

      return res.status(200).send({ ...tokens, userId: user._id });
    } catch (error) {
      return res.status(500).json({
        message: 'На сервере произошла ошибка. Попробуйте позже'
      });
    }
  }
]);

const isTokenInvalid = ({ data, dbToken }) => !data || !dbToken || data._id !== dbToken?.user?.toString()

router.post('/token', async (req, res) => {
  try {
    const { refresh_token: refreshToken } = req.body;
    const data = tokenService.validateRefresh(refreshToken);

    const dbToken = await tokenService.findOne(refreshToken);

    if (isTokenInvalid({ data, dbToken })) {
      return res.status(401).json({
        error: {
          message: 'Unauthorized',
          code: 401
        }
      })
    }

    const userId = dbToken.user.toString();
    const tokens = tokenService.generate({ _id: userId });
    await tokenService.save(userId, tokens.refreshToken);

    return res.status(200).send({ ...tokens, userId });
  } catch (error) {
    return res.status(500).json({
      message: 'На сервере произошла ошибка. Попробуйте позже'
    });
  }
});

module.exports = router;