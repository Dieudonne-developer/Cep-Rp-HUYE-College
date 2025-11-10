const mongoose = require('mongoose');

const abanyamugishaIdeaSchema = new mongoose.Schema({
  group: { type: String, enum: ['abanyamugisha'], default: 'abanyamugisha' },
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
}, { collection: 'abanyamugisha_ideas' });

const AbanyamugishaImplementedIdea = mongoose.model('AbanyamugishaImplementedIdea', abanyamugishaIdeaSchema);
module.exports = AbanyamugishaImplementedIdea;

