const { Schema, model } = require('mongoose');

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  completedMeetings: Number,
  image: String,
  profession: {
    type: Schema.Types.ObjectId,
    ref: 'Profession',
  },
  qualities: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Quality',
    }
  ],
  rate: Number,
  sex: {
    type: String,
    enum: ['mail', 'female', 'other']
  }
}, {
  timestamps: true
});

module.exports = model('User', schema);