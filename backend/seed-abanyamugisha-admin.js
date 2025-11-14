require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AbanyamugishaUser = require('./models/AbanyamugishaUser');
const { getMongoUri, getDbName } = require('./utils/mongoUri');

const mongoUri = getMongoUri();
const dbName = getDbName();

async function run() {
  await mongoose.connect(mongoUri, { dbName: dbName });
  console.log('Connected to MongoDB:', mongoUri);

  const adminCredentials = {
    email: 'abanyamugisha.admin@example.com',
    username: 'abanyamugisha-admin',
    password: 'admin123',
    profileImage: null,
    isVerified: true,
    isApproved: true,
    approvedBy: 'system',
    approvedAt: new Date()
  };

  const emailLower = adminCredentials.email.toLowerCase();
  const existing = await AbanyamugishaUser.findOne({ email: emailLower });
  if (existing) {
    console.log('Admin already exists:', emailLower);
  } else {
    const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);
    const admin = new AbanyamugishaUser({
      email: emailLower,
      username: adminCredentials.username,
      password: hashedPassword,
      profileImage: adminCredentials.profileImage,
      isVerified: adminCredentials.isVerified,
      isApproved: adminCredentials.isApproved,
      approvedBy: adminCredentials.approvedBy,
      approvedAt: adminCredentials.approvedAt,
      adminGroup: 'abanyamugisha',
      userGroup: 'abanyamugisha'
    });
    await admin.save();
    console.log('Created Abanyamugisha admin:', emailLower, 'password:', adminCredentials.password);
  }

  console.log('Login URLs:');
  console.log('   Local: http://localhost:5173/abanyamugisha/admin/login');
  console.log('   Generic: http://localhost:5173/admin/login');

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});



