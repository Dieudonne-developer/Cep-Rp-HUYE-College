const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, default: '' }, // Optional for file attachments or voice notes
  timestamp: { type: Date, default: Date.now },
  type: { type: String, default: 'user' }, // 'user', 'system', 'voice', 'file'
  avatar: { type: String },
  status: { type: String, default: 'sent' }, // 'sending', 'sent', 'delivered', 'read'
  group: { 
    type: String, 
    enum: ['choir', 'cepier', 'admins', 'anointed', 'abanyamugisha', 'psalm23', 'psalm46', 'protocol', 'social', 'evangelical'],
    default: 'choir',
    required: true,
    index: true // Index for faster queries
  },
  voiceNote: {
    url: String,
    duration: Number,
    waveform: [Number]
  },
  fileAttachment: {
    fileName: String,
    fileSize: Number,
    fileType: String, // 'image', 'video', 'audio', 'document'
    mimeType: String,
    fileUrl: String,
    thumbnailUrl: String,
    duration: Number,
    dimensions: {
      width: Number,
      height: Number
    }
  }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
