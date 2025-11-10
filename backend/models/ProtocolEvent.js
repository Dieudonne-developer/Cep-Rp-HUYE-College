const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  imageUrl: { type: String },
  group: { type: String, default: 'protocol' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'protocol_events' });

const ProtocolEvent = mongoose.model('ProtocolEvent', eventSchema);
module.exports = ProtocolEvent;



