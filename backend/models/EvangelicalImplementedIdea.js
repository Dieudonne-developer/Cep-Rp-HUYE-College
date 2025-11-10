const mongoose = require('mongoose');

const evangelicalIdeaSchema = new mongoose.Schema({
  group: { type: String, enum: ['evangelical'], default: 'evangelical' },
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
}, { collection: 'evangelical_ideas' });

// Check if model already exists to avoid "Cannot overwrite model" error
const EvangelicalImplementedIdea = mongoose.models.EvangelicalImplementedIdea || mongoose.model('EvangelicalImplementedIdea', evangelicalIdeaSchema);
module.exports = EvangelicalImplementedIdea;