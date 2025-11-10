const mongoose = require('mongoose');

const cepierUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  profileImage: { type: String },
  role: { type: String, enum: ['super-admin', 'admin', 'editor', 'viewer'], default: 'viewer' },
  adminGroup: { type: String, default: 'cepier' },
  userGroup: { type: String, default: 'cepier' },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  verificationToken: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String }
}, { collection: 'cepier_users' });

const CepierUser = mongoose.models.CepierUser || mongoose.model('CepierUser', cepierUserSchema);
module.exports = CepierUser;




