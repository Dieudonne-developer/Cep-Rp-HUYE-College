const { withDatabase } = require('./src/db/script');
const Song = require('./models/Song');
const Event = require('./models/Event');
const Idea = require('./models/ImplementedIdea');

withDatabase(async () => {
  const existing = await Song.countDocuments({});
  if (existing > 0) {
    console.log(`⚠️  Sample songs already present (${existing}). Skipping seed.`);
    return;
  }

  const song = new Song({
    title: 'Ishyanga Ryera',
    artist: 'Ishyanga Ryera Choir',
    description: 'Sample choir song stored in Neon Postgres',
    mediaType: 'audio',
    category: 'choir',
  });
  await song.save();

  const event = new Event({
    title: 'Sunday rehearsal',
    description: 'Sample event stored in Neon Postgres',
    date: new Date(),
    location: 'Huye College',
  });
  await event.save();

  const idea = new Idea({
    idea: 'Record a new worship set',
    category: 'song',
    name: 'Choir',
    implementedDate: new Date(),
  });
  await idea.save();

  console.log('✅ Seeded sample song, event, and idea');
});
