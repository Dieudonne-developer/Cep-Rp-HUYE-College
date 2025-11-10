const mongoose = require('mongoose');

const socialIdeaSchema = new mongoose.Schema({
  group: { type: String, enum: ['social'], default: 'social' },
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
}, { collection: 'social_ideas' });

const SocialImplementedIdea = mongoose.model('SocialImplementedIdea', socialIdeaSchema);
module.exports = SocialImplementedIdea;

