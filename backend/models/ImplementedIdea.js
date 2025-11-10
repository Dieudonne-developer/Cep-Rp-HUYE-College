const mongoose = require('mongoose');

const choirIdeaSchema = new mongoose.Schema({
  group: { type: String, enum: ['choir'], default: 'choir' },
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
}, { collection: 'choir_ideas' });

const ChoirImplementedIdea = mongoose.model('ChoirImplementedIdea', choirIdeaSchema);
module.exports = ChoirImplementedIdea;

