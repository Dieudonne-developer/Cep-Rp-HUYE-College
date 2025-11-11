require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all user models
const ChoirUser = require('./models/UserRegistration');
const AnointedUser = require('./models/AnointedUser');
const AbanyamugishaUser = require('./models/AbanyamugishaUser');
const Psalm23User = require('./models/Psalm23User');
const Psalm46User = require('./models/Psalm46User');
const ProtocolUser = require('./models/ProtocolUser');
const SocialUser = require('./models/SocialUser');
const EvangelicalUser = require('./models/EvangelicalUser');

// Try to load CepierUser (may not exist)
let CepierUser;
try {
  CepierUser = require('./models/CepierUser');
} catch (error) {
  console.log('CepierUser model not found, skipping...');
  CepierUser = null;
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cep_database';

// Generic admin credentials that work for all groups
const adminCredentials = {
  email: 'admin@cep.com',
  username: 'admin',
  password: 'admin123',
  profileImage: null,
  isVerified: true,
  isApproved: true,
  approvedBy: 'system',
  approvedAt: new Date(),
  role: 'admin'
};

async function createAdminInModel(UserModel, groupName) {
  try {
    const emailLower = adminCredentials.email.toLowerCase();
    const existing = await UserModel.findOne({ email: emailLower });
    
    if (existing) {
      console.log(`✅ Admin already exists in ${groupName}: ${emailLower}`);
      // Update existing admin to ensure it has correct properties
      existing.isVerified = true;
      existing.isApproved = true;
      existing.role = 'admin';
      existing.adminGroup = groupName;
      if (!existing.password) {
        const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);
        existing.password = hashedPassword;
      }
      await existing.save();
      console.log(`   Updated ${groupName} admin account`);
      return;
    }
    
    const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);
    const admin = new UserModel({
      email: emailLower,
      username: adminCredentials.username,
      password: hashedPassword,
      profileImage: adminCredentials.profileImage,
      isVerified: adminCredentials.isVerified,
      isApproved: adminCredentials.isApproved,
      approvedBy: adminCredentials.approvedBy,
      approvedAt: adminCredentials.approvedAt,
      role: adminCredentials.role,
      adminGroup: groupName,
      userGroup: groupName
    });
    
    await admin.save();
    console.log(`✅ Created ${groupName} admin: ${emailLower}`);
  } catch (error) {
    console.error(`❌ Error creating ${groupName} admin:`, error.message);
  }
}

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    console.log('\n📝 Creating admin accounts for all groups...\n');
    
    // Create admin in all groups
    await createAdminInModel(ChoirUser, 'choir');
    await createAdminInModel(AnointedUser, 'anointed');
    await createAdminInModel(AbanyamugishaUser, 'abanyamugisha');
    await createAdminInModel(Psalm23User, 'psalm23');
    await createAdminInModel(Psalm46User, 'psalm46');
    await createAdminInModel(ProtocolUser, 'protocol');
    await createAdminInModel(SocialUser, 'social');
    await createAdminInModel(EvangelicalUser, 'evangelical');
    
    if (CepierUser) {
      await createAdminInModel(CepierUser, 'cepier');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Admin accounts created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Admin Credentials (works for all groups):');
    console.log('   Email: admin@cep.com');
    console.log('   Password: admin123');
    console.log('\n🌐 Login URL:');
    console.log('   https://cep-frontend-vy68.onrender.com/admin/login');
    console.log('\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

run();

