require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AnointedUser = require('./models/AnointedUser');

async function createAnointedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cep_database');
  const email = 'anointed.admin@cep-huye.org'.toLowerCase();
  const password = await bcrypt.hash('anointed123', 10);
  const exists = await AnointedUser.findOne({ email });
  if (exists) {
    console.log('Anointed admin already exists!');
    process.exit(0);
  }
  const user = new AnointedUser({
    email,
    username: 'anointed-admin',
    password,
    isVerified: true,
    isApproved: true,
    adminGroup: 'anointed',
    userGroup: 'anointed',
    role: 'admin'
  });
  await user.save();
  console.log('Anointed admin created!');
  process.exit(0);
}
createAnointedAdmin();


