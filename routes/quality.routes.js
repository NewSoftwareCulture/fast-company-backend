const express = require('express');
const QualityModel = require('../models/QualityModel');

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  try {
    const list = await QualityModel.find();
    return res.status(200).send(list);
  } catch (error) {
    return res.status(500).json({
      message: 'На сервере произошла ошибка. Попробуйте позже'
    });
  }
});

module.exports = router;