const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
  },
  { timestamps: true }
);

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    fileUrl: { type: String },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String },
    imageUrl: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const choirSongSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String },
    description: { type: String },
    fileUrl: { type: String },
    thumbnailUrl: { type: String },
    duration: { type: String },
    downloadable: { type: Boolean, default: false },
    category: { type: String, default: 'choir' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const choirActivitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String },
    imageUrl: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const choirIdeaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['song', 'event', 'improvement', 'other'], default: 'other' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    votes: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    role: { type: String, enum: ['choir_admin', 'super_admin'], default: 'choir_admin' },
  },
  { timestamps: true }
);

const choirMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    voicePart: { type: String, enum: ['soprano', 'alto', 'tenor', 'bass'], required: true },
    joinDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    profileImage: { type: String },
  },
  { timestamps: true }
);

const chatMessageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    fileUrl: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create models
const User = mongoose.model('User', userSchema);
const Group = mongoose.model('Group', groupSchema);
const Message = mongoose.model('Message', messageSchema);
const Activity = mongoose.model('Activity', activitySchema);
const ChoirSong = mongoose.model('ChoirSong', choirSongSchema);
const ChoirActivity = mongoose.model('ChoirActivity', choirActivitySchema);
const ChoirIdea = mongoose.model('ChoirIdea', choirIdeaSchema);
const Admin = mongoose.model('Admin', adminSchema);
const ChoirMember = mongoose.model('ChoirMember', choirMemberSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = {
  User,
  Group,
  Message,
  Activity,
  ChoirSong,
  ChoirActivity,
  ChoirIdea,
  Admin,
  ChoirMember,
  ChatMessage
};



