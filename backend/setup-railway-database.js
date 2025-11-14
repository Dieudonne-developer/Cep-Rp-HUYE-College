/**
 * Master Setup Script for Railway MongoDB Database
 * 
 * This script:
 * 1. Connects to Railway MongoDB at gondola.proxy.rlwy.net:30232
 * 2. Uses database: cep-app-database
 * 3. Seeds all admin accounts (super admin, universal admin, family admins)
 * 4. Initializes all collections/models
 * 
 * Usage:
 *   MONGODB_URI="mongodb://mongo:USERNAME:PASSWORD@gondola.proxy.rlwy.net:30232/cep-app-database" node setup-railway-database.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all user models
const ChoirUser = require('./models/UserRegistration');
const CepierUser = require('./models/CepierUser');
const AnointedUser = require('./models/AnointedUser');
const AbanyamugishaUser = require('./models/AbanyamugishaUser');
const Psalm23User = require('./models/Psalm23User');
const Psalm46User = require('./models/Psalm46User');
const ProtocolUser = require('./models/ProtocolUser');
const SocialUser = require('./models/SocialUser');
const EvangelicalUser = require('./models/EvangelicalUser');

const { getMongoUri, getDbName } = require('./utils/mongoUri');

// Railway MongoDB connection string (without database name)
const mongoUri = getMongoUri();
const dbName = getDbName();

mongoose.set('strictQuery', true);

// ============================================
// ADMIN CREDENTIALS
// ============================================

// Super Admin (CEPier family only)
const superAdminCredentials = {
  email: 'superadmin@cep.com',
  username: 'superadmin',
  password: 'SuperAdmin@2024',
  role: 'super-admin',
  adminGroup: 'cepier',
  userGroup: 'cepier'
};

// Universal Admin (works for all groups)
const universalAdminCredentials = {
  email: 'admin@cep.com',
  username: 'admin',
  password: 'admin123',
  role: 'admin'
};

// Family Group Admins
const familyAdmins = [
  {
    groupName: 'choir',
    displayName: 'Ishyanga Ryera Choir',
    email: 'choir@cep.com',
    username: 'choiradmin',
    password: 'choir123',
    UserModel: ChoirUser
  },
  {
    groupName: 'anointed',
    displayName: 'Anointed worship team',
    email: 'anointed@cep.com',
    username: 'anointedadmin',
    password: 'anointed123',
    UserModel: AnointedUser
  },
  {
    groupName: 'abanyamugisha',
    displayName: 'Abanyamugisha family',
    email: 'abanyamugisha@cep.com',
    username: 'abanyamugishaadmin',
    password: 'abanyamugisha123',
    UserModel: AbanyamugishaUser
  },
  {
    groupName: 'psalm23',
    displayName: 'Psalm 23 family',
    email: 'psalm23@cep.com',
    username: 'psalm23admin',
    password: 'psalm23123',
    UserModel: Psalm23User
  },
  {
    groupName: 'psalm46',
    displayName: 'Psalm 46 family',
    email: 'psalm46@cep.com',
    username: 'psalm46admin',
    password: 'psalm46123',
    UserModel: Psalm46User
  },
  {
    groupName: 'protocol',
    displayName: 'Protocol family',
    email: 'protocol@cep.com',
    username: 'protocoladmin',
    password: 'protocol123',
    UserModel: ProtocolUser
  },
  {
    groupName: 'social',
    displayName: 'Social family',
    email: 'social@cep.com',
    username: 'socialadmin',
    password: 'social123',
    UserModel: SocialUser
  },
  {
    groupName: 'evangelical',
    displayName: 'Evangelical family',
    email: 'evangelical@cep.com',
    username: 'evangelicaladmin',
    password: 'evangelical123',
    UserModel: EvangelicalUser
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

async function createOrUpdateUser(UserModel, credentials, options = {}) {
  try {
    const emailLower = credentials.email.toLowerCase();
    const usernameLower = credentials.username.toLowerCase();
    
    const existing = await UserModel.findOne({
      $or: [
        { email: emailLower },
        { username: usernameLower }
      ]
    });
    
    if (existing) {
      // Update existing user
      existing.isVerified = true;
      existing.isApproved = true;
      existing.role = credentials.role || 'admin';
      existing.adminGroup = options.adminGroup || credentials.adminGroup || existing.adminGroup;
      existing.userGroup = options.userGroup || credentials.userGroup || existing.userGroup;
      
      // Update password if provided
      if (credentials.password) {
        const passwordMatch = await bcrypt.compare(credentials.password, existing.password || '');
        if (!existing.password || !passwordMatch) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          existing.password = hashedPassword;
        }
      }
      
      await existing.save();
      return { created: false, updated: true, user: existing };
    }
    
    // Create new user
    const hashedPassword = credentials.password ? await bcrypt.hash(credentials.password, 10) : null;
    const newUser = new UserModel({
      email: emailLower,
      username: usernameLower,
      password: hashedPassword,
      profileImage: null,
      isVerified: true,
      isApproved: true,
      approvedBy: 'system',
      approvedAt: new Date(),
      role: credentials.role || 'admin',
      adminGroup: options.adminGroup || credentials.adminGroup,
      userGroup: options.userGroup || credentials.userGroup
    });
    
    await newUser.save();
    return { created: true, updated: false, user: newUser };
  } catch (error) {
    console.error(`❌ Error creating/updating user ${credentials.email}:`, error.message);
    return { created: false, updated: false, error: error.message };
  }
}

async function createSuperAdmin() {
  console.log('\n📝 Creating Super Admin...');
  const result = await createOrUpdateUser(CepierUser, superAdminCredentials);
  if (result.created) {
    console.log(`✅ Created Super Admin: ${superAdminCredentials.email}`);
  } else if (result.updated) {
    console.log(`✅ Updated Super Admin: ${superAdminCredentials.email}`);
  } else {
    console.log(`⚠️  Super Admin setup: ${result.error || 'skipped'}`);
  }
  return result;
}

async function createUniversalAdmin() {
  console.log('\n📝 Creating Universal Admin (all groups)...');
  const results = [];
  
  // Create in all groups
  const allUserModels = [
    { model: ChoirUser, group: 'choir' },
    { model: AnointedUser, group: 'anointed' },
    { model: AbanyamugishaUser, group: 'abanyamugisha' },
    { model: Psalm23User, group: 'psalm23' },
    { model: Psalm46User, group: 'psalm46' },
    { model: ProtocolUser, group: 'protocol' },
    { model: SocialUser, group: 'social' },
    { model: EvangelicalUser, group: 'evangelical' },
    { model: CepierUser, group: 'cepier' }
  ];
  
  for (const { model, group } of allUserModels) {
    const result = await createOrUpdateUser(model, universalAdminCredentials, {
      adminGroup: group,
      userGroup: group
    });
    results.push({ group, ...result });
  }
  
  const created = results.filter(r => r.created).length;
  const updated = results.filter(r => r.updated).length;
  console.log(`✅ Universal Admin: ${created} created, ${updated} updated across all groups`);
  return results;
}

async function createFamilyAdmins() {
  console.log('\n📝 Creating Family Group Admins...');
  const results = [];
  
  for (const familyAdmin of familyAdmins) {
    const result = await createOrUpdateUser(familyAdmin.UserModel, {
      email: familyAdmin.email,
      username: familyAdmin.username,
      password: familyAdmin.password,
      role: 'admin'
    }, {
      adminGroup: familyAdmin.groupName,
      userGroup: familyAdmin.groupName
    });
    
    if (result.created) {
      console.log(`✅ Created ${familyAdmin.displayName} admin`);
    } else if (result.updated) {
      console.log(`✅ Updated ${familyAdmin.displayName} admin`);
    } else {
      console.log(`⚠️  ${familyAdmin.displayName}: ${result.error || 'skipped'}`);
    }
    
    results.push({ ...familyAdmin, ...result });
  }
  
  return results;
}

async function initializeCollections() {
  console.log('\n📝 Initializing collections...');
  
  // List of all models to initialize (just creating indexes by querying)
  const models = [
    { name: 'UserRegistration', model: ChoirUser },
    { name: 'CepierUser', model: CepierUser },
    { name: 'AnointedUser', model: AnointedUser },
    { name: 'AbanyamugishaUser', model: AbanyamugishaUser },
    { name: 'Psalm23User', model: Psalm23User },
    { name: 'Psalm46User', model: Psalm46User },
    { name: 'ProtocolUser', model: ProtocolUser },
    { name: 'SocialUser', model: SocialUser },
    { name: 'EvangelicalUser', model: EvangelicalUser }
  ];
  
  for (const { name, model } of models) {
    try {
      // Initialize collection by checking if it exists (creates it if not)
      const count = await model.countDocuments();
      console.log(`   ✅ ${name}: ${count} documents`);
    } catch (error) {
      console.log(`   ⚠️  ${name}: ${error.message}`);
    }
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function run() {
  try {
    console.log('🚀 Railway MongoDB Database Setup');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Connecting to: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    console.log(`📊 Database: cep-app-database`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority'
    });
    console.log(`📊 Database: ${dbName}`);
    
    console.log('✅ Connected to Railway MongoDB successfully!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port || 'default'}\n`);
    
    // Initialize collections
    await initializeCollections();
    
    // Create Super Admin
    await createSuperAdmin();
    
    // Create Universal Admin
    await createUniversalAdmin();
    
    // Create Family Admins
    await createFamilyAdmins();
    
    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Admin Credentials Summary:\n');
    
    console.log('1. Super Admin (Full Access - CEPier only)');
    console.log(`   Email:    ${superAdminCredentials.email}`);
    console.log(`   Password: ${superAdminCredentials.password}`);
    console.log(`   Role:     ${superAdminCredentials.role}\n`);
    
    console.log('2. Universal Admin (All Groups)');
    console.log(`   Email:    ${universalAdminCredentials.email}`);
    console.log(`   Password: ${universalAdminCredentials.password}`);
    console.log(`   Role:     ${universalAdminCredentials.role}\n`);
    
    console.log('3. Family Group Admins:');
    familyAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.displayName}`);
      console.log(`      Email:    ${admin.email}`);
      console.log(`      Password: ${admin.password}`);
      console.log(`      Group:    ${admin.groupName}\n`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Login URLs:');
    console.log('   Local:    http://localhost:3000/admin/login');
    console.log('   Vercel:   https://cep-rp-huye-college.vercel.app/admin/login');
    console.log('   Render:   https://cep-frontend-vy68.onrender.com/admin/login');
    console.log('\n💡 All accounts are verified and approved.');
    console.log('💡 Database: cep-app-database on Railway MongoDB\n');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup Error:', error.message);
    console.error('Stack:', error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
run();

