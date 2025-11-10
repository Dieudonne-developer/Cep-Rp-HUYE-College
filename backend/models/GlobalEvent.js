const mongoose = require('mongoose');

const globalEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  eventTime: { type: String },
  location: { type: String },
  imageUrl: { type: String },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'global_events' });

const GlobalEvent = mongoose.models.GlobalEvent || mongoose.model('GlobalEvent', globalEventSchema);
module.exports = GlobalEvent;




