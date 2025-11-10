const mongoose = require('mongoose');

const choirSongSchema = new mongoose.Schema({
  // all current schema fields
  group: { type: String, enum: ['choir'], default: 'choir' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  title: { type: String, required: true },
  artist: { type: String, default: 'Ishyanga Ryera Choir' },
  description: { type: String },
  fileUrl: { type: String },
  url: { type: String },
  thumbnailUrl: { type: String },
  thumbnail: { type: String },
  mediaType: { type: String, enum: ['audio', 'video'], default: 'audio' },
  duration: { type: String },
  downloadable: { type: Boolean, default: false },
  category: { type: String, default: 'choir' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'choir_songs' });

const ChoirSong = mongoose.model('ChoirSong', choirSongSchema);
module.exports = ChoirSong;
