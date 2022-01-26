const ProfessionModel = require('../models/ProfessionModel');
const QualityModel = require('../models/QualityModel');

const professionsMock = require('../mock/professions.json')
const qualitiesMock = require('../mock/qualities.json')

const createInitialEntity = async (Model, data) => {
  await Model.collection.drop();

  return Promise.all(data.map(async (item) => {
    try {
      delete item._id
      const newItem = new Model(item);
      await newItem.save();
      return newItem;
    } catch (error) {
      return error;
    }
  }))
}

module.exports = async () => {
  const professions = await ProfessionModel.find();
  if (professions.length !== professionsMock.length) {
    await createInitialEntity(ProfessionModel, professionsMock);
  }

  const qualities = await QualityModel.find();
  if (qualities.length !== qualitiesMock.length) {
    await createInitialEntity(QualityModel, qualitiesMock);
  }
}