require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const SocialUser = require('./models/SocialUser');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cep_database';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB:', mongoUri);

  const adminCredentials = {
    email: 'social.admin@example.com',
    username: 'social-admin',
    password: 'admin123',
    profileImage: null,
    isVerified: true,
    isApproved: true,
    approvedBy: 'system',
    approvedAt: new Date()
  };

  const emailLower = adminCredentials.email.toLowerCase();
  const existing = await SocialUser.findOne({ email: emailLower });
  if (existing) {
    console.log('Admin already exists:', emailLower);
  } else {
    const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);
    const admin = new SocialUser({
      email: emailLower,
      username: adminCredentials.username,
      password: hashedPassword,
      profileImage: adminCredentials.profileImage,
      isVerified: adminCredentials.isVerified,
      isApproved: adminCredentials.isApproved,
      approvedBy: adminCredentials.approvedBy,
      approvedAt: adminCredentials.approvedAt,
      adminGroup: 'social',
      userGroup: 'social'
    });
    await admin.save();
    console.log('Created Social admin:', emailLower, 'password:', adminCredentials.password);
  }

  console.log('Login URLs:');
  console.log('   Local: http://localhost:5173/social/admin/login');
  console.log('   Generic: http://localhost:5173/admin/login');

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});



