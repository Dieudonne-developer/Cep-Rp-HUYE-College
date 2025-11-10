const mongoose = require('mongoose');

const protocolUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  profileImage: { type: String },
  role: { type: String, enum: ['super-admin', 'admin', 'editor', 'viewer'], default: 'viewer' },
  adminGroup: { type: String, default: 'protocol' },
  userGroup: { type: String, default: 'protocol' },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  verificationToken: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String }
}, { collection: 'protocol_users' });

const ProtocolUser = mongoose.model('ProtocolUser', protocolUserSchema);
module.exports = ProtocolUser;



