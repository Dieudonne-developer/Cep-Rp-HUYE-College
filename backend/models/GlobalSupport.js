const mongoose = require('mongoose');

const globalSupportSchema = new mongoose.Schema({
  bank: {
    bankName: { type: String, default: 'Bank of Kigali' },
    accountName: { type: String, default: 'CEP Ishyanga Ryera Choir' },
    accountNumber: { type: String, default: '00040-06945783-07' },
    swiftCode: { type: String, default: 'BKIGRWRW' }
  },
  mobileMoney: {
    mtn: { type: String, default: '0788 123 456 (Alice Uwase)' },
    airtel: { type: String, default: '0732 987 654 (Eric Mugisha)' }
  },
  onlineDonationNote: { type: String, default: 'Paystack verification pending server integration.' },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'global_support' });

const GlobalSupport = mongoose.models.GlobalSupport || mongoose.model('GlobalSupport', globalSupportSchema);
module.exports = GlobalSupport;




