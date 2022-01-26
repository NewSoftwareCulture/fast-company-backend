const express = require('express');

const auth = require('../middleware/auth.middleware');
const CommentModel = require('../models/CommentModel');

const router = express.Router({ mergeParams: true });

router.get('/', auth, async (req, res) => {
  try {
    const { orderBy, equalTo } = req.params;
    const comments = await CommentModel.find({ [orderBy]: [equalTo] }).lean();
    return res.send(comments);
  } catch (error) {
    return res.status(500).json({
      message: 'На сервере произошла ошибка. Попробуйте позже'
    });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const comment = await CommentModel.create({
      _id: req.user._id,
      ...req.body
    });
    return res.status(201).send(comment);
  } catch (error) {
    return res.status(500).json({
      message: 'На сервере произошла ошибка. Попробуйте позже'
    });
  }
});

router.delete('/:commentId', auth, async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await CommentModel.findById(commentId);
    
    if (comment.userId.toString() !== req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await comment.remove();
    return res.send(true);
  } catch (error) {
    return res.status(500).json({
      message: 'На сервере произошла ошибка. Попробуйте позже'
    });
  }
});

module.exports = router;