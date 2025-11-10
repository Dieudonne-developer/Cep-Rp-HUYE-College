const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  imageUrl: { type: String },
  group: { type: String, default: 'abanyamugisha' },
  ownerAdminId: { type: String },
  ownerAdminEmail: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'abanyamugisha_events' });

const AbanyamugishaEvent = mongoose.model('AbanyamugishaEvent', eventSchema);
module.exports = AbanyamugishaEvent;



