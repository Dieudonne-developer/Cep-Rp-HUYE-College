const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  mimeType: { type: String, default: 'image/jpeg' },
  // Base64 string without data URL prefix
  data: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.models.Asset || mongoose.model('Asset', AssetSchema);



