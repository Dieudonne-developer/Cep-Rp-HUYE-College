const mongoose = require('mongoose');

const abanyamugishaSongSchema = new mongoose.Schema({
  group: { type: String, enum: ['abanyamugisha'], default: 'abanyamugisha' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  title: { type: String, required: true },
  artist: { type: String, default: 'Abanyamugisha Family' },
  description: { type: String },
  fileUrl: { type: String },
  url: { type: String },
  thumbnailUrl: { type: String },
  thumbnail: { type: String },
  mediaType: { type: String, enum: ['audio', 'video'], default: 'audio' },
  duration: { type: String },
  downloadable: { type: Boolean, default: false },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'abanyamugisha_songs' });

const AbanyamugishaSong = mongoose.model('AbanyamugishaSong', abanyamugishaSongSchema);
module.exports = AbanyamugishaSong;