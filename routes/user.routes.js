const express = require('express');

const auth = require('../middleware/auth.middleware');
const UserModel = require('../models/UserModel');

const router = express.Router({ mergeParams: true });

router.patch('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId !== req.user._id) return res.status(401).json({ message: 'Unauthorized' });

    const user = await UserModel.findByIdAndUpdate(userId, req.body, { new: true });
    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).json({
      message: 'На сервере произошла ошибка. Попробуйте позже'
    });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const users = await UserModel.find().lean();
    return res.status(200).send(users);
  } catch (error) {
    return res.status(500).json({
      message: 'На сервере произошла ошибка. Попробуйте позже'
    });
  }
});

module.exports = router;