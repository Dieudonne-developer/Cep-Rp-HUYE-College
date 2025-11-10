const mongoose = require('mongoose');

const groupSupportSchema = new mongoose.Schema({
  group: {
    type: String,
    enum: ['choir', 'cepier', 'anointed', 'abanyamugisha', 'psalm23', 'psalm46', 'protocol', 'social', 'evangelical'],
    required: true,
    unique: true,
    index: true
  },
  bank: {
    bankName: { type: String, default: '' },
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    swiftCode: { type: String, default: '' }
  },
  mobileMoney: {
    mtn: { type: String, default: '' },
    airtel: { type: String, default: '' }
  },
  onlineDonationNote: { type: String, default: 'Paystack verification pending server integration.' },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'group_support' });

const GroupSupport = mongoose.models.GroupSupport || mongoose.model('GroupSupport', groupSupportSchema);
module.exports = GroupSupport;





