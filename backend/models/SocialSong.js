const mongoose = require('mongoose');

const socialSongSchema = new mongoose.Schema({
  group: { type: String, enum: ['social'], default: 'social' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  title: { type: String, required: true },
  artist: { type: String, default: 'Social Family' },
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
}, { collection: 'social_songs' });

const SocialSong = mongoose.model('SocialSong', socialSongSchema);
module.exports = SocialSong;