const mongoose = require('mongoose');

const psalm46SongSchema = new mongoose.Schema({
  group: { type: String, enum: ['psalm46'], default: 'psalm46' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  title: { type: String, required: true },
  artist: { type: String, default: 'Psalm 46 Family' },
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
}, { collection: 'psalm46_songs' });

const Psalm46Song = mongoose.model('Psalm46Song', psalm46SongSchema);
module.exports = Psalm46Song;