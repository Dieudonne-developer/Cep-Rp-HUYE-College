require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const EvangelicalUser = require('./models/EvangelicalUser');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cep_database';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB:', mongoUri);

  const adminCredentials = {
    email: 'evangelical.admin@example.com',
    username: 'evangelical-admin',
    password: 'admin123',
    profileImage: null,
    isVerified: true,
    isApproved: true,
    approvedBy: 'system',
    approvedAt: new Date()
  };

  const emailLower = adminCredentials.email.toLowerCase();
  const existing = await EvangelicalUser.findOne({ email: emailLower });
  if (existing) {
    console.log('Admin already exists:', emailLower);
  } else {
    const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);
    const admin = new EvangelicalUser({
      email: emailLower,
      username: adminCredentials.username,
      password: hashedPassword,
      profileImage: adminCredentials.profileImage,
      isVerified: adminCredentials.isVerified,
      isApproved: adminCredentials.isApproved,
      approvedBy: adminCredentials.approvedBy,
      approvedAt: adminCredentials.approvedAt,
      adminGroup: 'evangelical',
      userGroup: 'evangelical'
    });
    await admin.save();
    console.log('Created Evangelical admin:', emailLower, 'password:', adminCredentials.password);
  }

  console.log('Login URLs:');
  console.log('   Local: http://localhost:5173/evangelical/admin/login');
  console.log('   Generic: http://localhost:5173/admin/login');

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});



