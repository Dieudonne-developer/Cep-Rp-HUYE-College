const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  imageUrl: { type: String },
  group: { type: String, default: 'evangelical' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'evangelical_events' });

const EvangelicalEvent = mongoose.model('EvangelicalEvent', eventSchema);
module.exports = EvangelicalEvent;



