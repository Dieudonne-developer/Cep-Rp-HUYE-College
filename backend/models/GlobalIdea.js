const mongoose = require('mongoose');

const globalIdeaSchema = new mongoose.Schema({
  idea: { type: String, required: true },
  category: { type: String },
  name: { type: String },
  email: { type: String },
  anonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'implemented'], default: 'pending' },
  notes: { type: String },
  implementationDetails: { type: String },
  implementedDate: { type: Date },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'global_ideas' });

const GlobalIdea = mongoose.models.GlobalIdea || mongoose.model('GlobalIdea', globalIdeaSchema);
module.exports = GlobalIdea;




