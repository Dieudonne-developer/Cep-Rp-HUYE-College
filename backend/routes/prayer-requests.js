const express = require('express');
const router = express.Router();
const PrayerRequest = require('../models/PrayerRequest');

// Public: get prayer requests by group
router.get('/', async (req, res) => {
  try {
    const group = req.query.group || 'abanyamugisha';
    const requests = await PrayerRequest.find({ group }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, requests: requests.map(r => r.toObject ? r.toObject() : r) });
  } catch (error) {
    console.error('Error fetching prayer requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch prayer requests' });
  }
});

// Public: submit prayer request
router.post('/', async (req, res) => {
  try {
    const { name, request, category, anonymous, group, userId, username } = req.body || {};
    if (!request || !String(request).trim()) {
      return res.status(400).json({ success: false, message: 'Prayer request is required' });
    }

    const doc = new PrayerRequest({
      name: name || '',
      request: String(request).trim(),
      category: category || 'general',
      anonymous: !!anonymous,
      group: group || 'abanyamugisha',
      userId: userId || null,
      username: username || '',
    });
    await doc.save();
    res.json({ success: true, message: 'Prayer request submitted', data: doc.toObject ? doc.toObject() : doc });
  } catch (error) {
    console.error('Error submitting prayer request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit prayer request' });
  }
});

module.exports = router;
