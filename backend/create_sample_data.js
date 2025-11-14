const mongoose = require('mongoose');
require('dotenv').config();
const { getMongoUri, getDbName } = require('./utils/mongoUri');

// Import models
const Song = require('./models/Song');
const Event = require('./models/Event');
const UserRegistration = require('./models/UserRegistration');

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(getMongoUri());
    console.log('Connected to MongoDB');

    // Clear existing data
    await Song.deleteMany({});
    await Event.deleteMany({});
    console.log('Cleared existing data');

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
      },
      {
        title: "Great Is Thy Faithfulness",
        artist: "Ishyanga Ryera Choir",
        description: "A timeless hymn of faithfulness",
        fileUrl: "https://example.com/great-is-thy-faithfulness.mp3",
        thumbnailUrl: "https://example.com/great-is-thy-faithfulness.jpg",
        duration: "4:05",
        downloadable: true,
        category: "hymn"
      },
      {
        title: "In Christ Alone",
        artist: "Ishyanga Ryera Choir",
        description: "A modern worship anthem",
        fileUrl: "https://example.com/in-christ-alone.mp3",
        thumbnailUrl: "https://example.com/in-christ-alone.jpg",
        duration: "4:32",
        downloadable: true,
        category: "worship"
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
      },
      {
        title: "Youth Choir Workshop",
        description: "Training session for new choir members",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // In 2 weeks
        location: "Music Room",
        imageUrl: "https://example.com/youth-workshop.jpg"
      },
      {
        title: "Community Outreach Concert",
        description: "Free concert for the local community",
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // In 6 weeks
        location: "Town Square",
        imageUrl: "https://example.com/community-concert.jpg"
      }
    ];

    // Insert sample data
    const createdSongs = await Song.insertMany(sampleSongs);
    const createdEvents = await Event.insertMany(sampleEvents);

    console.log(`✅ Created ${createdSongs.length} songs`);
    console.log(`✅ Created ${createdEvents.length} events`);
    console.log('Sample data created successfully!');

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  createSampleData();
}

module.exports = createSampleData;



