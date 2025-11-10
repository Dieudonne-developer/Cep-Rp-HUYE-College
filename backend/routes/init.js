const express = require('express');
const router = express.Router();
const GlobalEvent = require('../models/GlobalEvent');
const GlobalIdea = require('../models/GlobalIdea');
const GlobalSupport = require('../models/GlobalSupport');
const GroupSupport = require('../models/GroupSupport');

// Public: list global activities
router.get('/activities', async (_req, res) => {
  try {
    const events = await GlobalEvent.find().sort({ date: -1, createdAt: -1 });
    // Map to eventDate for frontend compatibility
    const mapped = events.map(e => {
      const eventObj = e.toObject();
      return {
        ...eventObj,
        eventDate: eventObj.date || eventObj.eventDate,
        eventTime: eventObj.eventTime || undefined
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
});

// Public: implemented ideas
router.get('/ideas', async (_req, res) => {
  try {
    const ideas = await GlobalIdea.find({ implementedDate: { $ne: null } }).sort({ implementedDate: -1 });
    res.json({ success: true, data: ideas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ideas' });
  }
});

// Public: submit idea
router.post('/ideas', async (req, res) => {
  try {
    const { idea, category, name, email, anonymous } = req.body || {};
    if (!idea || !String(idea).trim()) return res.status(400).json({ success: false, message: 'Idea is required' });
    const doc = new GlobalIdea({ idea: String(idea).trim(), category, name, email, anonymous: !!anonymous });
    await doc.save();
    res.json({ success: true, message: 'Idea submitted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit idea' });
  }
});

// Public: support info (global)
router.get('/support', async (_req, res) => {
  try {
    let doc = await GlobalSupport.findOne();
    if (!doc) doc = await GlobalSupport.create({});
    res.json({ success: true, support: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch support info' });
  }
});

// Public: group-specific support info
router.get('/support/:group', async (req, res) => {
  try {
    const group = req.params.group.toLowerCase();
    let doc = await GroupSupport.findOne({ group });
    if (!doc) {
      // Create empty document if not found
      doc = await GroupSupport.create({ group });
    }
    res.json({ success: true, support: doc });
  } catch (error) {
    console.error('Error fetching group support:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch support info' });
  }
});

module.exports = router;


