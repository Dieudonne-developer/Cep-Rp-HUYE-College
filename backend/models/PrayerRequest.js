const { createModel } = require('../src/db/createModel');

const PrayerRequest = createModel('prayer_requests', {
  defaults: {
    group: 'abanyamugisha',
    name: '',
    request: '',
    category: 'general',
    anonymous: false,
    userId: null,
    username: '',
  },
});

module.exports = PrayerRequest;
