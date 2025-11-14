require('dotenv').config();
const mongoose = require('mongoose');
const Song = require('./models/Song');
const Event = require('./models/Event');
const ImplementedIdea = require('./models/ImplementedIdea');
const UserRegistration = require('./models/UserRegistration');
const { getMongoUri } = require('./utils/mongoUri');

const mongoUri = getMongoUri();

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const updates = [];

    updates.push(Song.updateMany({ $or: [{ group: { $exists: false } }, { group: null }] }, { $set: { group: 'choir' } }));
    updates.push(Event.updateMany({ $or: [{ group: { $exists: false } }, { group: null }] }, { $set: { group: 'choir' } }));
    updates.push(ImplementedIdea.updateMany({ $or: [{ group: { $exists: false } }, { group: null }] }, { $set: { group: 'choir' } }));
    updates.push(UserRegistration.updateMany({ $or: [{ userGroup: { $exists: false } }, { userGroup: null }] }, { $set: { userGroup: 'choir' } }));

    const results = await Promise.all(updates);
    console.log('🛠️  Backfill complete:', {
      songsUpdated: results[0]?.modifiedCount,
      eventsUpdated: results[1]?.modifiedCount,
      ideasUpdated: results[2]?.modifiedCount,
      usersUpdated: results[3]?.modifiedCount,
    });
  } catch (err) {
    console.error('❌ Backfill failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

run();







