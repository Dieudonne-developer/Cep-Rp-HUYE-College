const express = require('express');
const router = express.Router();
const ChoirSong = require('../models/Song');
const AnointedSong = require('../models/AnointedSong');
const AbanyamugishaSong = require('../models/AbanyamugishaSong');
const Psalm23Song = require('../models/Psalm23Song');
const Psalm46Song = require('../models/Psalm46Song');
const ProtocolSong = require('../models/ProtocolSong');
const SocialSong = require('../models/SocialSong');
const EvangelicalSong = require('../models/EvangelicalSong');
const ChoirEvent = require('../models/Event');
const AnointedEvent = require('../models/AnointedEvent');
const AbanyamugishaEvent = require('../models/AbanyamugishaEvent');
const Psalm23Event = require('../models/Psalm23Event');
const Psalm46Event = require('../models/Psalm46Event');
const ProtocolEvent = require('../models/ProtocolEvent');
const SocialEvent = require('../models/SocialEvent');
const EvangelicalEvent = require('../models/EvangelicalEvent');
const ChoirImplementedIdea = require('../models/ImplementedIdea');
const AnointedImplementedIdea = require('../models/AnointedImplementedIdea');
const AbanyamugishaImplementedIdea = require('../models/AbanyamugishaImplementedIdea');
const Psalm23ImplementedIdea = require('../models/Psalm23ImplementedIdea');
const Psalm46ImplementedIdea = require('../models/Psalm46ImplementedIdea');
const ProtocolImplementedIdea = require('../models/ProtocolImplementedIdea');
const SocialImplementedIdea = require('../models/SocialImplementedIdea');
const EvangelicalImplementedIdea = require('../models/EvangelicalImplementedIdea');

const pickGroup = (req) => (['anointed', 'abanyamugisha', 'psalm23', 'psalm46', 'protocol', 'social', 'evangelical'].includes((req.query.group || '').toLowerCase()) ? req.query.group.toLowerCase() : 'choir');

const pickSongModel = (group) => group === 'anointed' ? AnointedSong : group === 'abanyamugisha' ? AbanyamugishaSong : group === 'psalm23' ? Psalm23Song : group === 'psalm46' ? Psalm46Song : group === 'protocol' ? ProtocolSong : group === 'social' ? SocialSong : group === 'evangelical' ? EvangelicalSong : ChoirSong;
const pickEventModel = (group) => group === 'anointed' ? AnointedEvent : group === 'abanyamugisha' ? AbanyamugishaEvent : group === 'psalm23' ? Psalm23Event : group === 'psalm46' ? Psalm46Event : group === 'protocol' ? ProtocolEvent : group === 'social' ? SocialEvent : group === 'evangelical' ? EvangelicalEvent : ChoirEvent;
const pickIdeaModel = (group) => group === 'anointed' ? AnointedImplementedIdea : group === 'abanyamugisha' ? AbanyamugishaImplementedIdea : group === 'psalm23' ? Psalm23ImplementedIdea : group === 'psalm46' ? Psalm46ImplementedIdea : group === 'protocol' ? ProtocolImplementedIdea : group === 'social' ? SocialImplementedIdea : group === 'evangelical' ? EvangelicalImplementedIdea : ChoirImplementedIdea;

// Public songs endpoint for choir page
router.get('/songs', async (req, res) => {
  try {
    const group = pickGroup(req);
    const Model = pickSongModel(group);
    const songs = await Model.find({ group }).sort({ createdAt: -1 });
    res.json(songs);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch songs' });
  }
});

// Public events endpoint for choir page
router.get('/events', async (req, res) => {
  try {
    const group = pickGroup(req);
    const Model = pickEventModel(group);
    const events = await Model.find({ group }).sort({ date: -1, createdAt: -1 });
    // Map date to eventDate for frontend compatibility
    const eventsWithEventDate = events.map(event => {
      const eventObj = event.toObject();
      eventObj.eventDate = eventObj.eventDate || eventObj.date;
      // Ensure imageUrl uses absolute URL if it's a relative path
      if (eventObj.imageUrl && !eventObj.imageUrl.startsWith('http')) {
        const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:4000';
        const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
        eventObj.imageUrl = `${protocol}://${host}${eventObj.imageUrl}`;
      }
      return eventObj;
    });
    res.json(eventsWithEventDate);
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// Get implemented ideas for choir page
router.get('/implemented-ideas', async (req, res) => {
  try {
    const group = pickGroup(req);
    const Model = pickIdeaModel(group);
    const ideas = await Model.find({ 
      implementedDate: { $exists: true, $ne: null },
      group
    }).sort({ implementedDate: -1 });
    res.json({ success: true, data: ideas });
  } catch (error) {
    console.error('Error fetching implemented ideas:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch implemented ideas' });
  }
});

// Submit new idea
router.post('/ideas', async (req, res) => {
  try {
    const group = pickGroup(req);
    const Model = pickIdeaModel(group);
    
    if (!Model) {
      console.error('Model not found for group:', group);
      return res.status(500).json({ success: false, message: 'Invalid group specified' });
    }
    
    const payload = req.body || {};
    
    // Validate required field
    if (!payload.idea && !payload.title && !payload.description) {
      return res.status(400).json({ success: false, message: 'Idea content is required' });
    }
    
    // Normalize group to lowercase to match enum
    const normalizedGroup = group.toLowerCase();
    
    const ideaData = { 
      idea: payload.idea || payload.title || payload.description || 'Idea',
      category: payload.category || 'other',
      name: payload.name || '',
      email: payload.email || '',
      anonymous: Boolean(payload.anonymous),
      group: normalizedGroup
    };
    
    console.log('Creating idea with data:', { ...ideaData, idea: ideaData.idea.substring(0, 50) + '...' });
    
    const newIdea = new Model(ideaData);
    await newIdea.save();
    res.json({ success: true, message: 'Idea submitted successfully', data: newIdea });
  } catch (e) {
    console.error('Idea submit error:', e);
    console.error('Error details:', {
      message: e.message,
      stack: e.stack,
      name: e.name,
      group: req.query.group,
      modelName: e.model?.constructor?.name
    });
    
    // If it's a validation error, provide more details
    if (e.name === 'ValidationError') {
      const errors = Object.keys(e.errors || {}).map(key => ({
        field: key,
        message: e.errors[key].message
      }));
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: errors,
        error: process.env.NODE_ENV === 'development' ? e.message : undefined 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit idea', 
      error: process.env.NODE_ENV === 'development' ? e.message : undefined 
    });
  }
});

module.exports = router;



