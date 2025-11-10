const mongoose = require('mongoose');

const protocolIdeaSchema = new mongoose.Schema({
  group: { type: String, enum: ['protocol'], default: 'protocol' },
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
}, { collection: 'protocol_ideas' });

const ProtocolImplementedIdea = mongoose.model('ProtocolImplementedIdea', protocolIdeaSchema);
module.exports = ProtocolImplementedIdea;

