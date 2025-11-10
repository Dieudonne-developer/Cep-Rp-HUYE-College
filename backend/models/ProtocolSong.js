const mongoose = require('mongoose');

const protocolSongSchema = new mongoose.Schema({
  group: { type: String, enum: ['protocol'], default: 'protocol' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  title: { type: String, required: true },
  artist: { type: String, default: 'Protocol Family' },
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
}, { collection: 'protocol_songs' });

const ProtocolSong = mongoose.model('ProtocolSong', protocolSongSchema);
module.exports = ProtocolSong;
