const mongoose = require('mongoose');

const choirEventSchema = new mongoose.Schema({
  group: { type: String, enum: ['choir'], default: 'choir' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  location: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'choir_events' });

const ChoirEvent = mongoose.model('ChoirEvent', choirEventSchema);
module.exports = ChoirEvent;



