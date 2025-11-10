const mongoose = require('mongoose');
const anointedSongSchema = new mongoose.Schema({
  group: { type: String, enum: ['anointed'], default: 'anointed' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  title: { type: String, required: true },
  artist: { type: String, default: 'Anointed Worship Team' },
  description: { type: String },
  fileUrl: { type: String },
  url: { type: String },
  thumbnailUrl: { type: String },
  thumbnail: { type: String },
  mediaType: { type: String, enum: ['audio', 'video'], default: 'audio' },
  duration: { type: String },
  downloadable: { type: Boolean, default: false },
  category: { type: String, default: 'anointed' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'anointed_songs' });

const AnointedSong = mongoose.model('AnointedSong', anointedSongSchema);
module.exports = AnointedSong;



