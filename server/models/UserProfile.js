const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  displayName: {
    type: String,
    trim: true,
    default: '',
  },
  // Base64 data URL of the picture the user uploaded, empty when they use their provider photo
  photoData: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
