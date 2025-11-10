const mongoose = require('mongoose');

const psalm46UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  profileImage: { type: String },
  role: { type: String, enum: ['super-admin', 'admin', 'editor', 'viewer'], default: 'viewer' },
  adminGroup: { type: String, default: 'psalm46' },
  userGroup: { type: String, default: 'psalm46' },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  verificationToken: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String }
}, { collection: 'psalm46_users' });

const Psalm46User = mongoose.model('Psalm46User', psalm46UserSchema);
module.exports = Psalm46User;




