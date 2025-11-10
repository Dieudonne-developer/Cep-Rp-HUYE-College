const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  imageUrl: { type: String },
  group: { type: String, default: 'psalm46' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'psalm46_events' });

const Psalm46Event = mongoose.model('Psalm46Event', eventSchema);
module.exports = Psalm46Event;




