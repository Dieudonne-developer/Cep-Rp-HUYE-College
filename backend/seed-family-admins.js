require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getMongoUri, getDbName } = require('./utils/mongoUri');

// Import all user models
const ChoirUser = require('./models/UserRegistration');
const AnointedUser = require('./models/AnointedUser');
const AbanyamugishaUser = require('./models/AbanyamugishaUser');
const Psalm23User = require('./models/Psalm23User');
const Psalm46User = require('./models/Psalm46User');
const ProtocolUser = require('./models/ProtocolUser');
const SocialUser = require('./models/SocialUser');
const EvangelicalUser = require('./models/EvangelicalUser');

const mongoUri = getMongoUri();
const dbName = getDbName();
mongoose.set('strictQuery', true);

// Family group admin configurations
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

async function createFamilyAdmin(config) {
  try {
    const { groupName, displayName, email, username, password, UserModel } = config;
    const emailLower = email.toLowerCase();
    const usernameLower = username.toLowerCase();
    
    // Check if admin already exists
    const existing = await UserModel.findOne({
      $or: [
        { email: emailLower },
        { username: usernameLower }
      ]
    });
    
    if (existing) {
      console.log(`✅ Admin already exists for ${displayName}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Username: ${existing.username}`);
      
      // Update existing admin to ensure correct properties
      existing.isVerified = true;
      existing.isApproved = true;
      existing.role = 'admin';
      existing.adminGroup = groupName;
      existing.userGroup = groupName;
      
      // Update password if it doesn't match
      const passwordMatch = await bcrypt.compare(password, existing.password || '');
      if (!existing.password || !passwordMatch) {
        const hashedPassword = await bcrypt.hash(password, 10);
        existing.password = hashedPassword;
        console.log(`   🔑 Password updated`);
      }
      
      await existing.save();
      console.log(`   ✅ Updated ${displayName} admin account\n`);
      return { created: false, updated: true, config };
    }
    
    // Create new admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new UserModel({
      email: emailLower,
      username: usernameLower,
      password: hashedPassword,
      profileImage: null,
      isVerified: true,
      isApproved: true,
      approvedBy: 'system',
      approvedAt: new Date(),
      role: 'admin',
      adminGroup: groupName,
      userGroup: groupName
    });
    
    await admin.save();
    console.log(`✅ Created admin for ${displayName}`);
    console.log(`   Email: ${emailLower}`);
    console.log(`   Username: ${usernameLower}`);
    console.log(`   Password: ${password}\n`);
    return { created: true, updated: false, config };
  } catch (error) {
    console.error(`❌ Error creating admin for ${config.displayName}:`, error.message);
    return { created: false, updated: false, error: error.message, config };
  }
}

async function run() {
  try {
    await mongoose.connect(mongoUri, { dbName: dbName });
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', dbName);
    console.log('\n📝 Creating admin accounts for all family groups...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const results = [];
    for (const familyAdmin of familyAdmins) {
      const result = await createFamilyAdmin(familyAdmin);
      results.push(result);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Family Admin Accounts Summary\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Display all credentials in a table format
    console.log('📋 Family Admin Credentials:\n');
    familyAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.displayName}`);
      console.log(`   Email:    ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log(`   Group:    ${admin.groupName}`);
      console.log('');
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Login URL:');
    console.log('   Local:    http://localhost:3000/admin/login');
    console.log('   Network:  http://YOUR_IP:3000/admin/login');
    console.log('\n💡 All accounts are verified and approved.');
    console.log('💡 Use these credentials to login as admin for each family group.\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

run();


