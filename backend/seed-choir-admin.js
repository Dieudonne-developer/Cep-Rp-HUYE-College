const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ChoirUser = require('./models/UserRegistration');
const { getMongoUri } = require('./utils/mongoUri');

const mongoUri = getMongoUri();

async function createChoirAdmin() {
  await mongoose.connect(mongoUri);
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
