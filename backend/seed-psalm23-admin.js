require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Psalm23User = require('./models/Psalm23User');
const { getMongoUri, getDbName } = require('./utils/mongoUri');

const mongoUri = getMongoUri();
const dbName = getDbName();

async function run() {
  await mongoose.connect(mongoUri, { dbName: dbName });
  console.log('Connected to MongoDB:', mongoUri);

  const adminCredentials = {
    email: 'psalm23.admin@example.com',
    username: 'psalm23-admin',
    password: 'admin123',
    profileImage: null,
    isVerified: true,
    isApproved: true,
    approvedBy: 'system',
    approvedAt: new Date()
  };

  const emailLower = adminCredentials.email.toLowerCase();
  const existing = await Psalm23User.findOne({ email: emailLower });
  if (existing) {
    console.log('Admin already exists:', emailLower);
  } else {
    const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);
    const admin = new Psalm23User({
      email: emailLower,
      username: adminCredentials.username,
      password: hashedPassword,
      profileImage: adminCredentials.profileImage,
      isVerified: adminCredentials.isVerified,
      isApproved: adminCredentials.isApproved,
      approvedBy: adminCredentials.approvedBy,
      approvedAt: adminCredentials.approvedAt,
      adminGroup: 'psalm23',
      userGroup: 'psalm23'
    });
    await admin.save();
    console.log('Created Psalm 23 admin:', emailLower, 'password:', adminCredentials.password);
  }

  console.log('Login URLs:');
  console.log('   Local: http://localhost:5173/psalm23/admin/login');
  console.log('   Generic: http://localhost:5173/admin/login');

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});




