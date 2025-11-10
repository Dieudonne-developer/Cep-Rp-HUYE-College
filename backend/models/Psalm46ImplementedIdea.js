const mongoose = require('mongoose');

const psalm46IdeaSchema = new mongoose.Schema({
  group: { type: String, enum: ['psalm46'], default: 'psalm46' },
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
}, { collection: 'psalm46_ideas' });

const Psalm46ImplementedIdea = mongoose.model('Psalm46ImplementedIdea', psalm46IdeaSchema);
module.exports = Psalm46ImplementedIdea;


