/**
 * Script to connect to Railway MongoDB and verify connection
 * Usage: node connect-railway-db.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Railway MongoDB connection string (points to cep-app-database)
const railwayMongoUri = 'mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database';

// Use Railway URI if MONGODB_URI is not set, otherwise use environment variable
const mongoUri = process.env.MONGODB_URI || railwayMongoUri;

console.log('🔌 Connecting to MongoDB...');
console.log('📍 Host:', mongoUri.includes('gondola.proxy.rlwy.net') ? 'Railway MongoDB (gondola.proxy.rlwy.net:30232)' : 'Custom URI');
console.log('🔗 URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials

const connectionOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 1,
  retryWrites: true,
  w: 'majority'
};

async function connectAndTest() {
  try {
    await mongoose.connect(mongoUri, connectionOptions);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('🔌 Port:', mongoose.connection.port);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections found:', collections.length);
    if (collections.length > 0) {
      collections.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.name}`);
      });
    } else {
      console.log('   (No collections found - database is empty)');
    }
    
    // Test a simple query
    const UserRegistration = require('./models/UserRegistration');
    const userCount = await UserRegistration.countDocuments();
    console.log(`\n👥 Users in ChoirUser collection: ${userCount}`);
    
    console.log('\n✅ Database connection test successful!');
    console.log('💡 You can now run seed scripts:');
    console.log('   npm run seed:family-admins');
    console.log('   npm run seed:super-admin');
    console.log('   npm run seed:all-admins');
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('📝 Error details:', error);
    process.exit(1);
  }
}

connectAndTest();

