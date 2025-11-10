const mongoose = require('mongoose');
const anointedUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  profileImage: { type: String },
  role: { type: String, enum: ['super-admin', 'admin', 'editor', 'viewer'], default: 'viewer' },
  adminGroup: { type: String, default: 'anointed' },
  userGroup: { type: String, default: 'anointed' },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  verificationToken: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String }
}, { collection: 'anointed_users' });

const AnointedUser = mongoose.model('AnointedUser', anointedUserSchema);
module.exports = AnointedUser;
