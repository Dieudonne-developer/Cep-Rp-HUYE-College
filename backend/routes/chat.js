const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get chat messages (filtered by group)
router.get('/messages', async (req, res) => {
  try {
    const group = (req.query.group || 'choir').toLowerCase();
    
    console.log('=== CHAT MESSAGES REQUEST ===');
    console.log('Group:', group);
    
    // Validate group
    const validGroups = ['choir', 'cepier', 'admins', 'anointed', 'abanyamugisha', 'psalm23', 'psalm46', 'protocol', 'social', 'evangelical'];
    if (!validGroups.includes(group)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group specified'
      });
    }
    
    const messages = await ChatMessage.find({ group })
      .sort({ timestamp: 1 })
      .limit(100); // Limit to last 100 messages
    
    console.log(`Found ${messages.length} messages for group: ${group}`);
    
    res.json({
      success: true,
      messages: messages,
      group: group
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Send a chat message (with group filtering)
router.post('/messages', async (req, res) => {
  try {
    const { user, message, type = 'user', avatar, voiceNote, fileAttachment, group } = req.body;
    
    console.log('=== SEND MESSAGE REQUEST ===');
    console.log('User:', user);
    console.log('Message:', message);
    console.log('Type:', type);
    console.log('Group:', group);
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User is required'
      });
    }
    
    // Validate group
    const validGroups = ['choir', 'cepier', 'admins', 'anointed', 'abanyamugisha', 'psalm23', 'psalm46', 'protocol', 'social', 'evangelical'];
    const messageGroup = (group || 'choir').toLowerCase();
    if (!validGroups.includes(messageGroup)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group specified'
      });
    }
    
    // Allow empty message for file attachments or voice notes
    if (!message && !fileAttachment && !voiceNote) {
      return res.status(400).json({
        success: false,
        message: 'Message, file attachment, or voice note is required'
      });
    }
    
    const chatMessage = new ChatMessage({
      user,
      message,
      type,
      avatar,
      voiceNote,
      fileAttachment,
      group: messageGroup,
      timestamp: new Date()
    });
    
    await chatMessage.save();
    
    console.log('Message saved successfully for group:', messageGroup);
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: chatMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Upload file for chat
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('=== FILE UPLOAD REQUEST ===');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }
    
    console.log('Uploaded file:', req.file);
    
    const file = req.file;
    const fileUrl = `http://localhost:4000/uploads/${file.filename}`;
    
    // Determine file type
    let fileType = 'document';
    if (file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      fileType = 'video';
    } else if (file.mimetype.startsWith('audio/')) {
      fileType = 'audio';
    }
    
    const fileAttachment = {
      fileName: file.originalname,
      fileSize: file.size,
      fileType: fileType,
      mimeType: file.mimetype,
      fileUrl: fileUrl
    };
    
    console.log('File attachment created:', fileAttachment);
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      fileAttachment: fileAttachment
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// Get online users (mock data for now)
router.get('/users/online', async (req, res) => {
  try {
    console.log('=== ONLINE USERS REQUEST ===');
    
    // For now, return mock data
    // In a real implementation, you'd track online users via Socket.IO
    const onlineUsers = [
      { name: 'User1', avatar: 'https://ui-avatars.com/api/?name=User1&background=FF6B6B&color=fff&size=200&bold=true', isOnline: true },
      { name: 'User2', avatar: 'https://ui-avatars.com/api/?name=User2&background=4ECDC4&color=fff&size=200&bold=true', isOnline: true }
    ];
    
    res.json({
      success: true,
      users: onlineUsers
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch online users',
      error: error.message
    });
  }
});

module.exports = router;
