const mongoose = require('mongoose');

const psalm23SongSchema = new mongoose.Schema({
  group: { type: String, enum: ['psalm23'], default: 'psalm23' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  title: { type: String, required: true },
  artist: { type: String, default: 'Psalm 23 Family' },
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
}, { collection: 'psalm23_songs' });

const Psalm23Song = mongoose.model('Psalm23Song', psalm23SongSchema);
module.exports = Psalm23Song;