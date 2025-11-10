require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const UserRegistration = require('./models/UserRegistration');

// Connect to MongoDB (single unified database)
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cep_database';
mongoose.set('strictQuery', true);

async function createAdminUser() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Admin credentials
    const adminCredentials = {
      email: 'admin@ishyangaryera.com',
      username: 'admin',
      password: 'admin123',
      profileImage: null,
      isVerified: true,
      isApproved: true,
      approvedBy: 'system',
      approvedAt: new Date(),
      role: 'admin',
      adminGroup: 'choir'
    };

    // Check if admin already exists
    const existingAdmin = await UserRegistration.findOne({ 
      $or: [
        { email: adminCredentials.email }, 
        { username: adminCredentials.username }
      ] 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Verified: ${existingAdmin.isVerified}`);
      console.log(`   Approved: ${existingAdmin.isApproved}`);
      console.log('\n📝 To reset, please delete this user from the database first.');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);

    // Create admin user
    const admin = new UserRegistration({
      email: adminCredentials.email,
      username: adminCredentials.username,
      password: hashedPassword,
      profileImage: adminCredentials.profileImage,
      isVerified: adminCredentials.isVerified,
      isApproved: adminCredentials.isApproved,
      approvedBy: adminCredentials.approvedBy,
      approvedAt: adminCredentials.approvedAt,
      role: adminCredentials.role,
      adminGroup: adminCredentials.adminGroup
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Email: admin@ishyangaryera.com');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔗 Admin Login URL:');
    console.log('   Local: http://localhost:5173/admin/login');
    console.log('   Network: http://172.16.12.113:5173/admin/login');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createAdminUser();


