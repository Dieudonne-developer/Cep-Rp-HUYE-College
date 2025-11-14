require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Psalm46User = require('./models/Psalm46User');
const { getMongoUri } = require('./utils/mongoUri');

const mongoUri = getMongoUri();

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB:', mongoUri);

  const adminCredentials = {
    email: 'psalm46.admin@example.com',
    username: 'psalm46-admin',
    password: 'admin123',
    profileImage: null,
    isVerified: true,
    isApproved: true,
    approvedBy: 'system',
    approvedAt: new Date()
  };

  const emailLower = adminCredentials.email.toLowerCase();
  const existing = await Psalm46User.findOne({ email: emailLower });
  if (existing) {
    console.log('Admin already exists:', emailLower);
  } else {
    const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);
    const admin = new Psalm46User({
      email: emailLower,
      username: adminCredentials.username,
      password: hashedPassword,
      profileImage: adminCredentials.profileImage,
      isVerified: adminCredentials.isVerified,
      isApproved: adminCredentials.isApproved,
      approvedBy: adminCredentials.approvedBy,
      approvedAt: adminCredentials.approvedAt,
      adminGroup: 'psalm46',
      userGroup: 'psalm46'
    });
    await admin.save();
    console.log('Created Psalm 46 admin:', emailLower, 'password:', adminCredentials.password);
  }

  console.log('Login URLs:');
  console.log('   Local: http://localhost:5173/psalm46/admin/login');
  console.log('   Generic: http://localhost:5173/admin/login');

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});




