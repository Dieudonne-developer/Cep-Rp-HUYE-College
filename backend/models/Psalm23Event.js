const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  imageUrl: { type: String },
  group: { type: String, default: 'psalm23' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'psalm23_events' });

const Psalm23Event = mongoose.model('Psalm23Event', eventSchema);
module.exports = Psalm23Event;




