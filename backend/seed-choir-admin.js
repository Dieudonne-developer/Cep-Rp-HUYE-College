const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ChoirUser = require('./models/UserRegistration');

async function createChoirAdmin() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cep_database');
  const email = 'choir.admin@cep-huye.org'.toLowerCase();
  const password = await bcrypt.hash('choir123', 10);
  const exists = await ChoirUser.findOne({ email });
  if (exists) {
    console.log('Choir admin already exists!');
    process.exit(0);
  }
  const user = new ChoirUser({
    email,
    username: 'choir-admin',
    password,
    isVerified: true,
    isApproved: true,
    adminGroup: 'choir',
    userGroup: 'choir',
    role: 'admin'
  });
  await user.save();
  console.log('Choir admin created!');
  process.exit(0);
}
createChoirAdmin();
