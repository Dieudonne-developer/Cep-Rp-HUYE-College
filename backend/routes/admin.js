const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserRegistration = require('../models/UserRegistration');
const ChoirUser = require('../models/UserRegistration');
const AnointedUser = require('../models/AnointedUser');
const ChoirSong = require('../models/Song');
const AnointedSong = require('../models/AnointedSong');
const ChoirEvent = require('../models/Event');
const AnointedEvent = require('../models/AnointedEvent');
const ChoirImplementedIdea = require('../models/ImplementedIdea');
const AnointedImplementedIdea = require('../models/AnointedImplementedIdea');
const upload = require('../middleware/upload');
const AbanyamugishaSong = require('../models/AbanyamugishaSong');
const AbanyamugishaEvent = require('../models/AbanyamugishaEvent');
const AbanyamugishaImplementedIdea = require('../models/AbanyamugishaImplementedIdea');
const AbanyamugishaUser = require('../models/AbanyamugishaUser');
const Psalm23Song = require('../models/Psalm23Song');
const Psalm23Event = require('../models/Psalm23Event');
const Psalm23ImplementedIdea = require('../models/Psalm23ImplementedIdea');
const Psalm23User = require('../models/Psalm23User');
const Psalm46Song = require('../models/Psalm46Song');
const Psalm46Event = require('../models/Psalm46Event');
const Psalm46ImplementedIdea = require('../models/Psalm46ImplementedIdea');
const Psalm46User = require('../models/Psalm46User');
const ProtocolSong = require('../models/ProtocolSong');
const ProtocolEvent = require('../models/ProtocolEvent');
const ProtocolImplementedIdea = require('../models/ProtocolImplementedIdea');
const ProtocolUser = require('../models/ProtocolUser');
const SocialSong = require('../models/SocialSong');
const SocialEvent = require('../models/SocialEvent');
const SocialImplementedIdea = require('../models/SocialImplementedIdea');
const SocialUser = require('../models/SocialUser');
const EvangelicalSong = require('../models/EvangelicalSong');
const EvangelicalEvent = require('../models/EvangelicalEvent');
const EvangelicalImplementedIdea = require('../models/EvangelicalImplementedIdea');
const EvangelicalUser = require('../models/EvangelicalUser');

const ALL_GROUPS = ['cepier', 'choir', 'anointed', 'abanyamugisha', 'psalm23', 'psalm46', 'protocol', 'social', 'evangelical'];

const resolveGroup = async (req) => {
  const headerGroup = (req.header('x-admin-group') || '').toLowerCase();
  if (ALL_GROUPS.includes(headerGroup)) return headerGroup;
  const queryGroup = (req.query.group || '').toLowerCase();
  if (ALL_GROUPS.includes(queryGroup)) return queryGroup;
  const adminEmail = req.header('x-admin-email');
  if (adminEmail) {
    try {
      const choir = await require('../models/UserRegistration').findOne({ email: adminEmail }).select('adminGroup');
      if (choir && ALL_GROUPS.includes(choir.adminGroup)) return choir.adminGroup;
      const anointed = await require('../models/AnointedUser').findOne({ email: adminEmail }).select('adminGroup');
      if (anointed && ALL_GROUPS.includes(anointed.adminGroup)) return anointed.adminGroup;
      const aba = await AbanyamugishaUser.findOne({ email: adminEmail }).select('adminGroup');
      if (aba && ALL_GROUPS.includes(aba.adminGroup)) return aba.adminGroup;
      const ps23 = await Psalm23User.findOne({ email: adminEmail }).select('adminGroup');
      if (ps23 && ALL_GROUPS.includes(ps23.adminGroup)) return ps23.adminGroup;
      const ps46 = await Psalm46User.findOne({ email: adminEmail }).select('adminGroup');
      if (ps46 && ALL_GROUPS.includes(ps46.adminGroup)) return ps46.adminGroup;
      const proto = await ProtocolUser.findOne({ email: adminEmail }).select('adminGroup');
      if (proto && ALL_GROUPS.includes(proto.adminGroup)) return proto.adminGroup;
      const social = await SocialUser.findOne({ email: adminEmail }).select('adminGroup');
      if (social && ALL_GROUPS.includes(social.adminGroup)) return social.adminGroup;
      const evangelical = await EvangelicalUser.findOne({ email: adminEmail }).select('adminGroup');
      if (evangelical && ALL_GROUPS.includes(evangelical.adminGroup)) return evangelical.adminGroup;
    } catch (_) {}
  }
  return 'choir';
}

function getSongModelForGroup(group) {
  if (group === 'anointed') return AnointedSong;
  if (group === 'abanyamugisha') return AbanyamugishaSong;
  if (group === 'psalm23') return Psalm23Song;
  if (group === 'psalm46') return Psalm46Song;
  if (group === 'protocol') return ProtocolSong;
  if (group === 'social') return SocialSong;
  if (group === 'evangelical') return EvangelicalSong;
  return ChoirSong;
}
function getEventModelForGroup(group) {
  if (group === 'anointed') return AnointedEvent;
  if (group === 'abanyamugisha') return AbanyamugishaEvent;
  if (group === 'psalm23') return Psalm23Event;
  if (group === 'psalm46') return Psalm46Event;
  if (group === 'protocol') return ProtocolEvent;
  if (group === 'social') return SocialEvent;
  if (group === 'evangelical') return EvangelicalEvent;
  return ChoirEvent;
}
function getIdeaModelForGroup(group) {
  if (group === 'anointed') return AnointedImplementedIdea;
  if (group === 'abanyamugisha') return AbanyamugishaImplementedIdea;
  if (group === 'psalm23') return Psalm23ImplementedIdea;
  if (group === 'psalm46') return Psalm46ImplementedIdea;
  if (group === 'protocol') return ProtocolImplementedIdea;
  if (group === 'social') return SocialImplementedIdea;
  if (group === 'evangelical') return EvangelicalImplementedIdea;
  return ChoirImplementedIdea;
}
function getUserModelForGroup(group) {
  if (group === 'cepier') return require('../models/CepierUser');
  if (group === 'anointed') return AnointedUser;
  if (group === 'abanyamugisha') return AbanyamugishaUser;
  if (group === 'psalm23') return Psalm23User;
  if (group === 'psalm46') return Psalm46User;
  if (group === 'protocol') return ProtocolUser;
  if (group === 'social') return SocialUser;
  if (group === 'evangelical') return EvangelicalUser;
  return ChoirUser;
}

// Admin login endpoint
router.post('/login', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please check MongoDB connection.',
        error: 'MongoDB not connected'
      });
    }
    
    let { email, password, adminGroup } = req.body;
    
    console.log('=== ADMIN LOGIN REQUEST ===');
    console.log('Email:', email);
    console.log('AdminGroup:', adminGroup);
    console.log('MongoDB ReadyState:', mongoose.connection.readyState);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    email = email.trim().toLowerCase();
    let user = null;
    let foundGroup = null;
    
    if (adminGroup === 'anointed') {
      user = await AnointedUser.findOne({ email });
      if (user) foundGroup = 'anointed';
    } else if (adminGroup === 'abanyamugisha') {
      user = await AbanyamugishaUser.findOne({ email });
      if (user) foundGroup = 'abanyamugisha';
    } else if (adminGroup === 'psalm23') {
      user = await Psalm23User.findOne({ email });
      if (user) foundGroup = 'psalm23';
    } else if (adminGroup === 'psalm46') {
      user = await Psalm46User.findOne({ email });
      if (user) foundGroup = 'psalm46';
    } else if (adminGroup === 'protocol') {
      user = await ProtocolUser.findOne({ email });
      if (user) foundGroup = 'protocol';
    } else if (adminGroup === 'social') {
      user = await SocialUser.findOne({ email });
      if (user) foundGroup = 'social';
    } else if (adminGroup === 'evangelical') {
      user = await EvangelicalUser.findOne({ email });
      if (user) foundGroup = 'evangelical';
    } else if (adminGroup === 'choir') {
      user = await ChoirUser.findOne({ email });
      if (user) foundGroup = 'choir';
    } else if (adminGroup === 'cepier') {
      const CepierUser = require('../models/CepierUser');
      user = await CepierUser.findOne({ email });
      if (user) foundGroup = 'cepier';
    } else {
      // When adminGroup is not provided, search all models
      try {
        const CepierUser = require('../models/CepierUser');
        const searchResults = await Promise.allSettled([
          ChoirUser.findOne({ email }).then(u => ({ user: u, group: 'choir' })).catch(e => ({ error: e, group: 'choir' })),
          CepierUser.findOne({ email }).then(u => ({ user: u, group: 'cepier' })).catch(e => ({ error: e, group: 'cepier' })),
          AnointedUser.findOne({ email }).then(u => ({ user: u, group: 'anointed' })).catch(e => ({ error: e, group: 'anointed' })),
          AbanyamugishaUser.findOne({ email }).then(u => ({ user: u, group: 'abanyamugisha' })).catch(e => ({ error: e, group: 'abanyamugisha' })),
          Psalm23User.findOne({ email }).then(u => ({ user: u, group: 'psalm23' })).catch(e => ({ error: e, group: 'psalm23' })),
          Psalm46User.findOne({ email }).then(u => ({ user: u, group: 'psalm46' })).catch(e => ({ error: e, group: 'psalm46' })),
          ProtocolUser.findOne({ email }).then(u => ({ user: u, group: 'protocol' })).catch(e => ({ error: e, group: 'protocol' })),
          SocialUser.findOne({ email }).then(u => ({ user: u, group: 'social' })).catch(e => ({ error: e, group: 'social' })),
          EvangelicalUser.findOne({ email }).then(u => ({ user: u, group: 'evangelical' })).catch(e => ({ error: e, group: 'evangelical' }))
        ]);
        
        // Find first successful result with a user
        for (const result of searchResults) {
          if (result.status === 'fulfilled' && result.value && result.value.user) {
            user = result.value.user;
            foundGroup = result.value.group;
            break;
          } else if (result.status === 'rejected') {
            console.error(`Error searching model:`, result.reason);
          } else if (result.value && result.value.error) {
            console.error(`Error in ${result.value.group} model:`, result.value.error);
          }
        }
      } catch (searchError) {
        console.error('Error in model search:', searchError);
        throw searchError;
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
    }
    
    // Check if user has a password
    if (!user.password) {
      console.error('User found but has no password:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Bcrypt error:', bcryptError);
      return res.status(500).json({
        success: false,
        message: 'Password verification failed',
        error: bcryptError.message
      });
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Allow admins and super-admins to access this portal
    const role = (user.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin and super-admin accounts can access the admin portal'
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not approved yet by admin.'
      });
    }
    
    console.log('Admin login successful for:', email, 'Group:', foundGroup, 'Role:', user.role);
    
    res.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: user._id,
        email: user.email,
        username: user.username,
        profileImage: user.profileImage,
        role: user.role || 'admin',
        adminGroup: foundGroup || user.adminGroup || adminGroup || 'choir'
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  }
});

// Admin password reset (for development/testing)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    console.log('=== ADMIN PASSWORD RESET ===');
    console.log('Email:', email);
    
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required'
      });
    }
    
    const user = await UserRegistration.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    console.log('Password reset successful for:', email);
    
    res.json({
      success: true,
      message: 'Password reset successful. You can now login with the new password.'
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

// --- Password reset for admin users (find in both tables) ---
router.post('/reset-admin-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ success: false, message: 'Email and new password are required' });
  const lcEmail = email.trim().toLowerCase();
  let user = await ChoirUser.findOne({ email: lcEmail }) || await AnointedUser.findOne({ email: lcEmail });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.password = await require('bcryptjs').hash(newPassword, 10);
  user.isVerified = true;
  user.isApproved = true;
  await user.save();
  res.json({ success: true, message: 'Password reset successful.' });
});

// Admin dashboard endpoint
router.get('/dashboard', async (req, res) => {
  try {
    const group = await resolveGroup(req)
    // Get basic statistics
    const totalUsers = await UserRegistration.countDocuments({ userGroup: group });
    const verifiedUsers = await UserRegistration.countDocuments({ isVerified: true, userGroup: group });
    const songsCountFilter = { group }
    const eventsCountFilter = { group }
    const totalSongs = await ChoirSong.countDocuments(songsCountFilter);
    const totalEvents = await ChoirEvent.countDocuments(eventsCountFilter);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        pendingVerification: totalUsers - verifiedUsers,
        totalSongs,
        totalEvents
      },
      recentActivity: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Admin songs endpoints
router.get('/songs', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const SongModel = getSongModelForGroup(group);
    const songs = await SongModel.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch songs' });
  }
});

router.post('/songs', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const SongModel = getSongModelForGroup(group);
    const { 
      title, 
      artist, 
      description, 
      fileUrl, 
      url, // Frontend field
      thumbnailUrl, 
      thumbnail, // Frontend field
      mediaType, // Frontend field
      duration, 
      downloadable, 
      category 
    } = req.body;
    
    // Default artist based on group
    const defaultArtists = {
      'anointed': 'Anointed Worship Team',
      'abanyamugisha': 'Abanyamugisha Family',
      'psalm23': 'Psalm 23 Family',
      'psalm46': 'Psalm 46 Family',
      'protocol': 'Protocol Family',
      'social': 'Social Family',
      'evangelical': 'Evangelical Family',
      'choir': 'Ishyanga Ryera Choir'
    };
    
    // Map frontend fields to backend fields
    const songData = {
      title,
      artist: artist || defaultArtists[group] || 'Ishyanga Ryera Choir',
      description,
      fileUrl: fileUrl || url, // Use url if fileUrl not provided
      url: url || fileUrl, // Store both for compatibility
      thumbnailUrl: thumbnailUrl || thumbnail, // Use thumbnail if thumbnailUrl not provided
      thumbnail: thumbnail || thumbnailUrl, // Store both for compatibility
      mediaType: mediaType || 'audio', // Default to audio
      duration,
      downloadable: downloadable || false,
      category: category && category.trim() ? category.trim() : undefined // Only set category if provided and not empty
    };
    
    const ownerAdminId = req.header('x-admin-id') || undefined;
    const ownerAdminEmail = req.header('x-admin-email') || undefined;
    const song = new SongModel({ ...songData, group, ownerAdminId, ownerAdminEmail });
    
    await song.save();
    res.json({ success: true, message: 'Song created successfully', song });
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ success: false, message: 'Failed to create song' });
  }
});

router.put('/songs/:id', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const SongModel = getSongModelForGroup(group);
    const { id } = req.params;
    const { 
      title, 
      artist, 
      description, 
      fileUrl, 
      url, 
      thumbnailUrl, 
      thumbnail, 
      mediaType, 
      duration, 
      downloadable, 
      category 
    } = req.body;
    
    // Default artist based on group
    const defaultArtists = {
      'anointed': 'Anointed Worship Team',
      'abanyamugisha': 'Abanyamugisha Family',
      'psalm23': 'Psalm 23 Family',
      'psalm46': 'Psalm 46 Family',
      'protocol': 'Protocol Family',
      'social': 'Social Family',
      'evangelical': 'Evangelical Family',
      'choir': 'Ishyanga Ryera Choir'
    };
    
    // Map frontend fields to backend fields
    const updateData = {
      title,
      artist: artist || defaultArtists[group] || 'Ishyanga Ryera Choir',
      description,
      fileUrl: fileUrl || url,
      url: url || fileUrl,
      thumbnailUrl: thumbnailUrl || thumbnail,
      thumbnail: thumbnail || thumbnailUrl,
      mediaType: mediaType || 'audio',
      duration,
      downloadable: downloadable || false,
      category: category && category.trim() ? category.trim() : undefined, // Only set category if provided and not empty
      updatedAt: new Date()
    };
    
    const match = { _id: id, group }
    const song = await SongModel.findOneAndUpdate(match, updateData, { new: true });
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    
    res.json({ success: true, message: 'Song updated successfully', song });
  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({ success: false, message: 'Failed to update song' });
  }
});

router.delete('/songs/:id', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const SongModel = getSongModelForGroup(group);
    const { id } = req.params;
    const match = { _id: id, group }
    const song = await SongModel.findOneAndDelete(match);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    
    res.json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ success: false, message: 'Failed to delete song' });
  }
});

// Admin events endpoints
router.get('/events', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const EventModel = getEventModelForGroup(group);
    const events = await EventModel.find().sort({ date: -1, createdAt: -1 });
    // Get the correct base URL for image URLs
    const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:4000';
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    // Map date to eventDate for frontend compatibility and ensure absolute image URLs
    const eventsWithEventDate = events.map(event => {
      const eventObj = event.toObject();
      eventObj.eventDate = eventObj.eventDate || eventObj.date;
      // Ensure imageUrl uses absolute URL if it's a relative path
      if (eventObj.imageUrl && !eventObj.imageUrl.startsWith('http')) {
        // If it starts with /uploads, prepend baseUrl
        if (eventObj.imageUrl.startsWith('/uploads')) {
          eventObj.imageUrl = `${baseUrl}${eventObj.imageUrl}`;
        } else {
          eventObj.imageUrl = `${baseUrl}/uploads/${eventObj.imageUrl}`;
        }
      }
      return eventObj;
    });
    res.json(eventsWithEventDate);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

router.post('/events', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const EventModel = getEventModelForGroup(group);
    const { title, description, date, eventDate, eventTime, location, imageUrl, status } = req.body;
    // Accept both 'date' and 'eventDate' for backward compatibility
    const eventDateValue = eventDate || date;
    const event = new EventModel({
      group,
      title,
      description,
      date: eventDateValue ? new Date(eventDateValue) : undefined,
      eventTime: eventTime || undefined, // Store eventTime if schema supports it
      location,
      imageUrl,
      status: status || 'upcoming',
      ownerAdminId: req.header('x-admin-id') || undefined,
      ownerAdminEmail: req.header('x-admin-email') || undefined,
    });
    await event.save();
    // Return event with eventDate for frontend compatibility
    const eventObj = event.toObject();
    eventObj.eventDate = eventObj.eventDate || eventObj.date;
    res.json({ success: true, message: 'Event created successfully', event: eventObj });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

router.put('/events/:id', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const EventModel = getEventModelForGroup(group);
    const { id } = req.params;
    const updateData = req.body;
    // Handle eventDate -> date mapping
    if (updateData.eventDate && !updateData.date) {
      updateData.date = new Date(updateData.eventDate);
    }
    updateData.updatedAt = new Date();
    const event = await EventModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    // Return event with eventDate for frontend compatibility
    const eventObj = event.toObject();
    eventObj.eventDate = eventObj.eventDate || eventObj.date;
    res.json({ success: true, message: 'Event updated successfully', event: eventObj });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const EventModel = getEventModelForGroup(group);
    const { id } = req.params;
    const event = await EventModel.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

// Admin members endpoints
router.get('/members', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const Model = getUserModelForGroup(group);
    // Include all users for the group (verified or not) so newly registered users show up for approval
    const members = await Model.find({ userGroup: group })
      .select('email username profileImage createdAt isApproved approvedAt approvedBy userGroup')
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch members' });
  }
});

// Get pending approval users
router.get('/members/pending', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const Model = getUserModelForGroup(group);
    const pendingUsers = await Model.find({ isVerified: true, isApproved: { $ne: true }, userGroup: group })
      .select('email username profileImage createdAt isApproved userGroup')
      .sort({ createdAt: -1 });
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending members:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending members' });
  }
});

// Approve user
router.post('/members/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const group = await resolveGroup(req);
    const { approvedBy } = req.body; // Admin username
    const Model = getUserModelForGroup(group);
    const user = await Model.findOneAndUpdate(
      { _id: id },
      { 
        isApproved: true, 
        approvedAt: new Date(),
        approvedBy: approvedBy || 'admin'
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, message: 'User approved successfully', user });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ success: false, message: 'Failed to approve user' });
  }
});

// Reject/Unapprove user
router.post('/members/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const group = await resolveGroup(req);
    const Model = getUserModelForGroup(group);
    
    const user = await Model.findOneAndUpdate(
      { _id: id },
      { isApproved: false },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, message: 'User approval revoked', user });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ success: false, message: 'Failed to reject user' });
  }
});

router.post('/members', async (req, res) => {
  try {
    res.json({ success: true, message: 'Member created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create member' });
  }
});

router.put('/members/:id', async (req, res) => {
  try {
    res.json({ success: true, message: 'Member updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update member' });
  }
});

router.delete('/members/:id', async (req, res) => {
  try {
    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete member' });
  }
});

// Admin ideas endpoints
router.get('/ideas', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const IdeaModel = getIdeaModelForGroup(group);
    const ideas = await IdeaModel.find().sort({ createdAt: -1 });
    // Map to match the frontend's expected format
    const formattedIdeas = ideas.map(idea => ({
      _id: idea._id,
      idea: idea.idea,
      category: idea.category,
      submittedBy: idea.name,
      email: idea.email,
      anonymous: idea.anonymous,
      status: idea.implementedDate ? 'implemented' : 'pending',
      notes: '',
      implementationDetails: '',
      implementedDate: idea.implementedDate,
      createdAt: idea.createdAt
    }));
    res.json(formattedIdeas);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ideas' });
  }
});

router.put('/ideas/:id', async (req, res) => {
  try {
    const group = await resolveGroup(req);
    const IdeaModel = getIdeaModelForGroup(group);
    const { id } = req.params;
    const { status, notes, implementationDetails } = req.body;
    
    const updateData = {};
    if (status === 'implemented') {
      updateData.implementedDate = new Date();
    }
    if (notes) updateData.notes = notes;
    if (implementationDetails) updateData.implementationDetails = implementationDetails;
    
    const idea = await IdeaModel.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }
    
    res.json({ success: true, message: 'Idea updated successfully', data: idea });
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({ success: false, message: 'Failed to update idea' });
  }
});

// File upload endpoints
router.post('/songs/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const group = await resolveGroup(req);
    const SongModel = getSongModelForGroup(group);
    const ownerAdminId = req.header('x-admin-id') || undefined;
    const ownerAdminEmail = req.header('x-admin-email') || undefined;
    
    // Get the correct base URL - check for forwarded host (from proxy) or use request host
    const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:4000';
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    // Get mediaType from request body (if provided), otherwise detect from file
    let mediaType = req.body.mediaType; // Use provided mediaType if available
    if (!mediaType || (mediaType !== 'audio' && mediaType !== 'video')) {
      // Fall back to detection if not provided or invalid
      const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase() || '';
      const mimetype = req.file.mimetype.toLowerCase();
      
      // Check both mimetype and file extension for better detection
      if (mimetype.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'].includes(fileExtension)) {
        mediaType = 'video';
      } else if (mimetype.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'].includes(fileExtension)) {
        mediaType = 'audio';
      } else {
        mediaType = 'audio'; // default fallback
      }
    }
    
    const { title, description = '', category = '', downloadable = 'false', artist } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required for uploaded song!' });
    }
    
    // Default artist based on group
    const defaultArtists = {
      'anointed': 'Anointed Worship Team',
      'abanyamugisha': 'Abanyamugisha Family',
      'psalm23': 'Psalm 23 Family',
      'psalm46': 'Psalm 46 Family',
      'protocol': 'Protocol Family',
      'social': 'Social Family',
      'evangelical': 'Evangelical Family',
      'choir': 'Ishyanga Ryera Choir'
    };
    
    const songData = {
      title,
      artist: artist || defaultArtists[group] || 'Ishyanga Ryera Choir',
      description,
      fileUrl,
      url: fileUrl,
      group,
      ownerAdminId,
      ownerAdminEmail,
      mediaType,
      downloadable: downloadable === 'true' || downloadable === true,
      category: category && category.trim() ? category.trim() : undefined, // Only set category if provided and not empty
    };
    const song = new SongModel(songData);
    await song.save();
    res.json({ success: true, message: 'Song file uploaded and saved successfully', song });
  } catch (error) {
    console.error('Error uploading song file:', error);
    res.status(500).json({ success: false, message: 'Failed to upload song file' });
  }
});

router.post('/events/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Get the correct base URL - check for forwarded host (from proxy) or use request host
    const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:4000';
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      message: 'Event file uploaded successfully',
      url: fileUrl, // Frontend expects 'url'
      fileUrl: fileUrl, // Also include 'fileUrl' for backward compatibility
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading event file:', error);
    res.status(500).json({ success: false, message: 'Failed to upload event file' });
  }
});

// Seed data endpoint (for testing)
router.post('/seed', async (req, res) => {
  try {
    // Create sample songs
    const sampleSongs = [
      {
        title: "Amazing Grace",
        artist: "Ishyanga Ryera Choir",
        description: "A beautiful rendition of the classic hymn",
        fileUrl: "https://example.com/amazing-grace.mp3",
        thumbnailUrl: "https://example.com/amazing-grace.jpg",
        duration: "3:45",
        downloadable: true,
        category: "hymn"
      },
      {
        title: "How Great Thou Art",
        artist: "Ishyanga Ryera Choir",
        description: "A powerful worship song",
        fileUrl: "https://example.com/how-great-thou-art.mp3",
        thumbnailUrl: "https://example.com/how-great-thou-art.jpg",
        duration: "4:12",
        downloadable: true,
        category: "worship"
      },
      {
        title: "Blessed Assurance",
        artist: "Ishyanga Ryera Choir",
        description: "A traditional gospel song",
        fileUrl: "https://example.com/blessed-assurance.mp3",
        thumbnailUrl: "https://example.com/blessed-assurance.jpg",
        duration: "3:28",
        downloadable: false,
        category: "gospel"
      }
    ];

    // Create sample events
    const sampleEvents = [
      {
        title: "Sunday Service Performance",
        description: "Weekly choir performance at the main service",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        location: "Main Church Hall",
        imageUrl: "https://example.com/sunday-service.jpg"
      },
      {
        title: "Christmas Concert",
        description: "Annual Christmas concert featuring traditional carols",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next month
        location: "Community Center",
        imageUrl: "https://example.com/christmas-concert.jpg"
      },
      {
        title: "Easter Celebration",
        description: "Special Easter service with choir performances",
        date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // In 2 months
        location: "Church Sanctuary",
        imageUrl: "https://example.com/easter-celebration.jpg"
      }
    ];

    // Clear existing data
    await ChoirSong.deleteMany({});
    await AnointedSong.deleteMany({});
    await ChoirEvent.deleteMany({});
    await AnointedEvent.deleteMany({});

    // Insert sample data
    const createdSongs = await ChoirSong.insertMany(sampleSongs);
    const createdEvents = await ChoirEvent.insertMany(sampleEvents);

    res.json({
      success: true,
      message: 'Sample data created successfully',
      songs: createdSongs.length,
      events: createdEvents.length
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed data'
    });
  }
});

// ==================== SUPER ADMIN ROUTES ====================
// Middleware to check super admin access
const checkSuperAdmin = async (req, res, next) => {
  try {
    const adminEmail = req.header('x-admin-email');
    
    if (!adminEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const ChoirUser = require('../models/UserRegistration');
    const CepierUser = require('../models/CepierUser');
    const AnointedUser = require('../models/AnointedUser');
    const AbanyamugishaUser = require('../models/AbanyamugishaUser');
    const Psalm23User = require('../models/Psalm23User');
    const Psalm46User = require('../models/Psalm46User');
    const ProtocolUser = require('../models/ProtocolUser');
    const SocialUser = require('../models/SocialUser');
    const EvangelicalUser = require('../models/EvangelicalUser');

    let admin = null;

    // Search across all user models
    const searchResults = await Promise.all([
      ChoirUser.findOne({ email: adminEmail.toLowerCase() }),
      CepierUser.findOne({ email: adminEmail.toLowerCase() }),
      AnointedUser.findOne({ email: adminEmail.toLowerCase() }),
      AbanyamugishaUser.findOne({ email: adminEmail.toLowerCase() }),
      Psalm23User.findOne({ email: adminEmail.toLowerCase() }),
      Psalm46User.findOne({ email: adminEmail.toLowerCase() }),
      ProtocolUser.findOne({ email: adminEmail.toLowerCase() }),
      SocialUser.findOne({ email: adminEmail.toLowerCase() }),
      EvangelicalUser.findOne({ email: adminEmail.toLowerCase() })
    ]);

    admin = searchResults.find(u => u !== null);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!admin.isVerified || !admin.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Admin account not verified or approved'
      });
    }

    if (admin.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required'
      });
    }

    req.superAdmin = {
      id: admin._id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      adminGroup: admin.adminGroup
    };

    next();
  } catch (error) {
    console.error('Super admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify super admin access'
    });
  }
};

// Get all admins across all groups
router.get('/super-admins', checkSuperAdmin, async (req, res) => {
  try {
    const ChoirUser = require('../models/UserRegistration');
    const CepierUser = require('../models/CepierUser');
    const AnointedUser = require('../models/AnointedUser');
    const AbanyamugishaUser = require('../models/AbanyamugishaUser');
    const Psalm23User = require('../models/Psalm23User');
    const Psalm46User = require('../models/Psalm46User');
    const ProtocolUser = require('../models/ProtocolUser');
    const SocialUser = require('../models/SocialUser');
    const EvangelicalUser = require('../models/EvangelicalUser');

    const [choirAdmins, cepierAdmins, anointedAdmins, abanyamugishaAdmins, psalm23Admins, psalm46Admins, protocolAdmins, socialAdmins, evangelicalAdmins] = await Promise.all([
      ChoirUser.find({ role: { $in: ['super-admin', 'admin', 'editor', 'viewer'] } }).select('-password'),
      CepierUser.find({ role: { $in: ['super-admin', 'admin', 'editor', 'viewer'] } }).select('-password'),
      AnointedUser.find({ role: { $in: ['super-admin', 'admin', 'editor', 'viewer'] } }).select('-password'),
      AbanyamugishaUser.find({ role: { $in: ['super-admin', 'admin', 'editor', 'viewer'] } }).select('-password'),
      Psalm23User.find({ role: { $in: ['super-admin', 'admin', 'editor', 'viewer'] } }).select('-password'),
      Psalm46User.find({ role: { $in: ['super-admin', 'admin', 'editor', 'viewer'] } }).select('-password'),
      ProtocolUser.find({ role: { $in: ['super-admin', 'admin', 'editor', 'viewer'] } }).select('-password'),
      SocialUser.find({ role: { $in: ['super-admin', 'admin', 'editor', 'viewer'] } }).select('-password'),
      EvangelicalUser.find({ role: { $in: ['super-admin', 'admin', 'editor', 'viewer'] } }).select('-password')
    ]);

    const allAdmins = [
      ...choirAdmins.map(a => ({ ...a.toObject(), adminGroup: 'choir' })),
      ...cepierAdmins.map(a => ({ ...a.toObject(), adminGroup: 'cepier' })),
      ...anointedAdmins.map(a => ({ ...a.toObject(), adminGroup: 'anointed' })),
      ...abanyamugishaAdmins.map(a => ({ ...a.toObject(), adminGroup: 'abanyamugisha' })),
      ...psalm23Admins.map(a => ({ ...a.toObject(), adminGroup: 'psalm23' })),
      ...psalm46Admins.map(a => ({ ...a.toObject(), adminGroup: 'psalm46' })),
      ...protocolAdmins.map(a => ({ ...a.toObject(), adminGroup: 'protocol' })),
      ...socialAdmins.map(a => ({ ...a.toObject(), adminGroup: 'social' })),
      ...evangelicalAdmins.map(a => ({ ...a.toObject(), adminGroup: 'evangelical' }))
    ];

    res.json({
      success: true,
      admins: allAdmins
    });
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new admin account
router.post('/super-admins/create', checkSuperAdmin, async (req, res) => {
  try {
    const { email, username, adminGroup, role } = req.body;

    if (!email || !username || !adminGroup) {
      return res.status(400).json({
        success: false,
        message: 'Email, username, and adminGroup are required'
      });
    }

    const UserModel = getUserModelForGroup(adminGroup);
    const { sendAdminInvitationEmail } = require('../utils/email');

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email or username already exists'
      });
    }

    // Generate verification token for password setup
    const verificationToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);

    // Create new admin without password (password will be set via email link)
    const newAdmin = new UserModel({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      verificationToken: verificationToken,
      role: role || 'admin',
      adminGroup: adminGroup,
      userGroup: adminGroup,
      isVerified: false, // Will be set to true when they set password
      isApproved: true,
      approvedBy: req.superAdmin.email,
      approvedAt: new Date()
    });

    await newAdmin.save();

    // Generate password setup link
    const baseUrl = req.protocol + '://' + req.get('host');
    const passwordSetupLink = `${baseUrl}/api/auth/verify?token=${verificationToken}`;

    // Send admin invitation email
    const emailResult = await sendAdminInvitationEmail(
      email.toLowerCase(),
      username,
      passwordSetupLink,
      adminGroup,
      role || 'admin'
    );

    const adminData = newAdmin.toObject();
    delete adminData.password;
    delete adminData.verificationToken;

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Admin created successfully! Invitation email has been sent to set password.',
        admin: adminData,
        emailSent: true,
        passwordSetupLink: passwordSetupLink // Include for super admin reference
      });
    } else {
      // Admin created but email failed - still return success with link
      res.json({
        success: true,
        message: 'Admin created successfully! However, email sending failed. Please send the password setup link manually.',
        admin: adminData,
        emailSent: false,
        emailError: emailResult.message,
        passwordSetupLink: passwordSetupLink
      });
    }
  } catch (error) {
    console.error('Failed to create admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Suspend/Reject admin account
router.put('/super-admins/:id/suspend', checkSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminGroup } = req.query;

    if (!adminGroup) {
      return res.status(400).json({
        success: false,
        message: 'adminGroup query parameter is required'
      });
    }

    const UserModel = getUserModelForGroup(adminGroup);
    const admin = await UserModel.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent suspending self
    if (admin.email === req.superAdmin.email) {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend your own account'
      });
    }

    admin.isApproved = false;
    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;

    res.json({
      success: true,
      message: 'Admin suspended successfully',
      admin: adminData
    });
  } catch (error) {
    console.error('Failed to suspend admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend admin',
      error: error.message
    });
  }
});

// Approve admin account
router.put('/super-admins/:id/approve', checkSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminGroup } = req.query;

    if (!adminGroup) {
      return res.status(400).json({
        success: false,
        message: 'adminGroup query parameter is required'
      });
    }

    const UserModel = getUserModelForGroup(adminGroup);
    const admin = await UserModel.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    admin.isApproved = true;
    admin.approvedBy = req.superAdmin.email;
    admin.approvedAt = new Date();
    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;

    res.json({
      success: true,
      message: 'Admin approved successfully',
      admin: adminData
    });
  } catch (error) {
    console.error('Failed to approve admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve admin',
      error: error.message
    });
  }
});

// Delete admin account
router.delete('/super-admins/:id', checkSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { adminGroup } = req.query;

    if (!adminGroup) {
      return res.status(400).json({
        success: false,
        message: 'adminGroup query parameter is required'
      });
    }

    const UserModel = getUserModelForGroup(adminGroup);
    const admin = await UserModel.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent deleting self
    if (admin.email === req.superAdmin.email) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await UserModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: error.message
    });
  }
});

// ==================== GLOBAL CONTENT (HOME) MANAGEMENT ====================
const GlobalEvent = require('../models/GlobalEvent');
const GlobalIdea = require('../models/GlobalIdea');
const GlobalSupport = require('../models/GlobalSupport');

// Activities (Events)
router.get('/super-admin/home/activities', checkSuperAdmin, async (_req, res) => {
  try {
    const events = await GlobalEvent.find().sort({ date: -1, createdAt: -1 });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
});

router.post('/super-admin/home/activities', checkSuperAdmin, async (req, res) => {
  try {
    const { title, description, date, eventDate, eventTime, location, imageUrl } = req.body;
    const newEvent = new GlobalEvent({
      title,
      description,
      date: eventDate ? new Date(eventDate) : (date ? new Date(date) : undefined),
      location,
      imageUrl,
      ownerAdminId: req.superAdmin.id,
      ownerAdminEmail: req.superAdmin.email
    });
    await newEvent.save();
    res.json({ success: true, event: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create activity' });
  }
});

router.put('/super-admin/home/activities/:id', checkSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (update.eventDate && !update.date) update.date = new Date(update.eventDate);
    update.updatedAt = new Date();
    const ev = await GlobalEvent.findByIdAndUpdate(id, update, { new: true });
    if (!ev) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true, event: ev });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update activity' });
  }
});

router.delete('/super-admin/home/activities/:id', checkSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const ev = await GlobalEvent.findByIdAndDelete(id);
    if (!ev) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete activity' });
  }
});

// Ideas
router.get('/super-admin/home/ideas', checkSuperAdmin, async (_req, res) => {
  try {
    const ideas = await GlobalIdea.find().sort({ createdAt: -1 });
    res.json({ success: true, ideas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ideas' });
  }
});

router.put('/super-admin/home/ideas/:id/implement', checkSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const idea = await GlobalIdea.findByIdAndUpdate(id, { implementedDate: new Date(), updatedAt: new Date() }, { new: true });
    if (!idea) return res.status(404).json({ success: false, message: 'Idea not found' });
    res.json({ success: true, idea });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update idea' });
  }
});

router.delete('/super-admin/home/ideas/:id', checkSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const idea = await GlobalIdea.findByIdAndDelete(id);
    if (!idea) return res.status(404).json({ success: false, message: 'Idea not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete idea' });
  }
});

// Support (singleton)
router.get('/super-admin/home/support', checkSuperAdmin, async (_req, res) => {
  try {
    let doc = await GlobalSupport.findOne();
    if (!doc) doc = await GlobalSupport.create({});
    res.json({ success: true, support: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch support info' });
  }
});

router.put('/super-admin/home/support', checkSuperAdmin, async (req, res) => {
  try {
    const payload = req.body || {};
    let doc = await GlobalSupport.findOne();
    if (!doc) doc = new GlobalSupport({});
    Object.assign(doc, payload);
    doc.updatedAt = new Date();
    await doc.save();
    res.json({ success: true, support: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update support info' });
  }
});

module.exports = router;
