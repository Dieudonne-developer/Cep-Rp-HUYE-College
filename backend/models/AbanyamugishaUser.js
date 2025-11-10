const mongoose = require('mongoose');

const abanyamugishaUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  profileImage: { type: String },
  role: { type: String, enum: ['super-admin', 'admin', 'editor', 'viewer'], default: 'viewer' },
  adminGroup: { type: String, default: 'abanyamugisha' },
  userGroup: { type: String, default: 'abanyamugisha' },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  verificationToken: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String }
}, { collection: 'abanyamugisha_users' });

const AbanyamugishaUser = mongoose.model('AbanyamugishaUser', abanyamugishaUserSchema);
module.exports = AbanyamugishaUser;



