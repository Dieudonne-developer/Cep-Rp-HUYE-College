const mongoose = require('mongoose');

const anointedIdeaSchema = new mongoose.Schema({
  group: { type: String, enum: ['anointed'], default: 'anointed' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  idea: { type: String, required: true },
  category: { type: String },
  name: { type: String },
  email: { type: String },
  anonymous: { type: Boolean, default: false },
  implementedDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'anointed_ideas' });

// Check if model already exists to avoid "Cannot overwrite model" error
const AnointedImplementedIdea = mongoose.models.AnointedImplementedIdea || mongoose.model('AnointedImplementedIdea', anointedIdeaSchema);
module.exports = AnointedImplementedIdea;