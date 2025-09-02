const mongoose = require('mongoose');

const adviceHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: { type: String, required: true },
  response: { type: String, required: true },
  queriedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdviceHistory', adviceHistorySchema);