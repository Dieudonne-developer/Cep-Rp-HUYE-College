const mongoose = require('mongoose');
const anointedEventSchema = new mongoose.Schema({
  group: { type: String, enum: ['anointed'], default: 'anointed' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  location: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'anointed_events' });

const AnointedEvent = mongoose.model('AnointedEvent', anointedEventSchema);
module.exports = AnointedEvent;



