require('dotenv').config();
const mongoose = require('mongoose');
const { getMongoUri, getDbName } = require('./utils/mongoUri');

// Connect to MongoDB (single unified database)
const mongoUri = getMongoUri();
const dbName = getDbName();
mongoose.set('strictQuery', true);

async function seedDatabase() {
  try {
    await mongoose.connect(mongoUri, { dbName: dbName });
    console.log('✅ Connected to MongoDB for seeding');

    // Import models
    const User = require('./server.js').User || mongoose.model('User', new mongoose.Schema({
      name: { type: String, required: true },
      phoneNumber: { type: String, index: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      isApproved: { type: Boolean, default: true },
      profilePicture: { type: String },
    }, { timestamps: true }));

    const Group = require('./server.js').Group || mongoose.model('Group', new mongoose.Schema({
      name: { type: String, required: true },
      description: { type: String },
    }, { timestamps: true }));

    const Activity = require('./server.js').Activity || mongoose.model('Activity', new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String },
      image: { type: String },
    }, { timestamps: true }));

    const Family = require('./server.js').Family || mongoose.model('Family', new mongoose.Schema({
      name: { type: String, required: true, unique: true },
      link: { type: String, default: '#' },
    }, { timestamps: true }));

    const ChoirMedia = require('./server.js').ChoirMedia || mongoose.model('ChoirMedia', new mongoose.Schema({
      mediaType: { type: String, enum: ['video', 'image'], required: true },
      title: { type: String, required: true },
      description: { type: String },
      url: { type: String, required: true },
      embedCode: { type: String },
      uploadDate: { type: Date, default: Date.now },
      thumbnail: { type: String },
    }, { timestamps: true }));

    const ChoirSong = require('./server.js').ChoirSong || mongoose.model('ChoirSong', new mongoose.Schema({
      title: { type: String, required: true },
      url: { type: String, required: true },
      downloadable: { type: Boolean, default: false },
    }, { timestamps: true }));

    const ChoirActivity = require('./server.js').ChoirActivity || mongoose.model('ChoirActivity', new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String },
      date: { type: Date, required: true },
      time: { type: String },
      location: { type: String },
      image: { type: String },
      kind: { type: String, enum: ['upcoming', 'regular', 'past'], required: true },
      schedule: { type: String },
    }, { timestamps: true }));

    const ChoirImplementedIdea = require('./server.js').ChoirImplementedIdea || mongoose.model('ChoirImplementedIdea', new mongoose.Schema({
      idea: { type: String, required: true },
      name: { type: String },
      anonymous: { type: Boolean, default: false },
      implementedDate: { type: Date },
    }, { timestamps: true }));

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Group.deleteMany({});
    await Activity.deleteMany({});
    await Family.deleteMany({});
    await ChoirMedia.deleteMany({});
    await ChoirSong.deleteMany({});
    await ChoirActivity.deleteMany({});
    await ChoirImplementedIdea.deleteMany({});

    // Seed Families
    console.log('👥 Seeding families...');
    const families = [
      { name: 'Ishyanga Ryera choir', link: '/choir' },
      { name: 'Anointed worship team', link: '#' },
      { name: 'Abanyamugisha family', link: '#' },
      { name: 'Psalm 23 family', link: '#' },
      { name: 'Psalm 46 family', link: '#' },
      { name: 'Protocol family', link: '#' },
      { name: 'Social family', link: '#' },
      { name: 'Evangelical family', link: '#' },
    ];
    await Family.insertMany(families);

    // Seed Default Group
    console.log('🏢 Seeding default group...');
    await Group.create({ name: 'Ishyanga Ryera Choir', description: 'Official choir group chat' });

    // Seed Activities
    console.log('📅 Seeding activities...');
    const activities = [
      {
        title: 'Weekly Sunday Service',
        description: 'Regular worship service participation',
        image: 'https://placehold.co/400x300/1e40af/ffffff?text=Sunday+Service'
      },
      {
        title: 'Choir Rehearsal',
        description: 'Weekly practice session',
        image: 'https://placehold.co/400x300/1e40af/ffffff?text=Rehearsal'
      },
      {
        title: 'Easter Concert 2024',
        description: 'Annual Easter celebration concert',
        image: 'https://placehold.co/400x300/1e40af/ffffff?text=Easter+Concert'
      }
    ];
    await Activity.insertMany(activities);

    // Seed Choir Media
    console.log('🎵 Seeding choir media...');
    const choirMedia = [
      {
        mediaType: 'video',
        title: 'Live Worship Session',
        description: 'Highlights from last concert',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        embedCode: '',
      },
      {
        mediaType: 'video',
        title: 'Easter Performance',
        description: 'Special Easter worship',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        embedCode: '',
      },
      {
        mediaType: 'image',
        title: 'Choir Photo 1',
        description: 'Rehearsal snapshot',
        url: 'https://placehold.co/600x400/1e40af/ffffff?text=Choir+Photo+1',
      },
      {
        mediaType: 'image',
        title: 'Choir Photo 2',
        description: 'Performance moment',
        url: 'https://placehold.co/600x400/1e40af/ffffff?text=Choir+Photo+2',
      },
      {
        mediaType: 'image',
        title: 'Choir Photo 3',
        description: 'Group photo',
        url: 'https://placehold.co/600x400/1e40af/ffffff?text=Choir+Photo+3',
      },
      {
        mediaType: 'image',
        title: 'Choir Photo 4',
        description: 'Concert stage',
        url: 'https://placehold.co/600x400/1e40af/ffffff?text=Choir+Photo+4',
      }
    ];
    await ChoirMedia.insertMany(choirMedia);

    // Seed Choir Songs
    console.log('🎶 Seeding choir songs...');
    const choirSongs = [
      { title: 'Psalm 23', url: 'https://example.com/audio/psalm23.mp3', downloadable: true },
      { title: 'Hallelujah', url: 'https://example.com/audio/hallelujah.mp3', downloadable: false },
      { title: 'Amazing Grace', url: 'https://example.com/audio/amazing_grace.mp3', downloadable: true },
      { title: 'How Great Thou Art', url: 'https://example.com/audio/how_great_thou_art.mp3', downloadable: true },
      { title: 'Blessed Assurance', url: 'https://example.com/audio/blessed_assurance.mp3', downloadable: false }
    ];
    await ChoirSong.insertMany(choirSongs);

    // Seed Choir Activities
    console.log('📆 Seeding choir activities...');
    const now = new Date();
    const choirActivities = [
      {
        title: 'Sunday Service Ministration',
        description: 'Special worship session',
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        time: '10:00',
        location: 'Main Hall',
        kind: 'upcoming',
      },
      {
        title: 'Weekly Rehearsal',
        schedule: 'Thursdays & Sundays',
        location: 'Music Room',
        date: now,
        kind: 'regular',
      },
      {
        title: 'Easter Concert',
        description: 'Annual concert celebration',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        image: 'https://placehold.co/400x300/1e40af/ffffff?text=Easter+Event',
        kind: 'past',
      },
      {
        title: 'Christmas Carols',
        description: 'Holiday performance',
        date: new Date(now.getFullYear() - 1, 11, 25),
        image: 'https://placehold.co/400x300/1e40af/ffffff?text=Christmas+Event',
        kind: 'past',
      }
    ];
    await ChoirActivity.insertMany(choirActivities);

    // Seed Choir Ideas
    console.log('💡 Seeding choir ideas...');
    const choirIdeas = [
      { 
        idea: 'Introduce new contemporary worship set', 
        anonymous: true, 
        implementedDate: new Date() 
      },
      { 
        idea: 'Add more Kinyarwanda hymns to repertoire', 
        name: 'Alice Uwase',
        anonymous: false, 
        implementedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      },
      { 
        idea: 'Organize monthly outreach concerts', 
        name: 'Eric Mugisha',
        anonymous: false, 
        implementedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) 
      }
    ];
    await ChoirImplementedIdea.insertMany(choirIdeas);

    // Seed Sample Users
    console.log('👤 Seeding sample users...');
    const users = [
      {
        name: 'Admin User',
        phoneNumber: '+250788123456',
        role: 'admin',
        isApproved: true
      },
      {
        name: 'Alice Uwase',
        phoneNumber: '+250788123457',
        role: 'user',
        isApproved: true
      },
      {
        name: 'Eric Mugisha',
        phoneNumber: '+250788123458',
        role: 'user',
        isApproved: true
      }
    ];
    await User.insertMany(users);

    console.log('✅ Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${families.length} families`);
    console.log(`   - ${activities.length} activities`);
    console.log(`   - ${choirMedia.length} choir media items`);
    console.log(`   - ${choirSongs.length} choir songs`);
    console.log(`   - ${choirActivities.length} choir activities`);
    console.log(`   - ${choirIdeas.length} implemented ideas`);
    console.log(`   - ${users.length} users`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDatabase();






