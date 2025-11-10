const mongoose = require('mongoose');

const psalm23IdeaSchema = new mongoose.Schema({
  group: { type: String, enum: ['psalm23'], default: 'psalm23' },
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
}, { collection: 'psalm23_ideas' });

const Psalm23ImplementedIdea = mongoose.model('Psalm23ImplementedIdea', psalm23IdeaSchema);
module.exports = Psalm23ImplementedIdea;


