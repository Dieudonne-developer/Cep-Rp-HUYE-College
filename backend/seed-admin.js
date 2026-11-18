const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const bcrypt = require('bcryptjs');
const UserRegistration = require('./models/UserRegistration');
const { connect, pool } = require('./src/db/pool');
const { migrate } = require('./src/db/migrate');

async function createAdminUser() {
  try {
    await connect();
    await migrate();
    console.log('✅ Connected to Neon Postgres');

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
      adminGroup: 'choir',
      userGroup: 'choir',
    };

    const existingAdmin = await UserRegistration.findOne({
      $or: [
        { email: adminCredentials.email },
        { username: adminCredentials.username },
      ],
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      await pool.end();
      return;
    }

    const hashedPassword = await bcrypt.hash(adminCredentials.password, 10);
    const admin = new UserRegistration({
      ...adminCredentials,
      password: hashedPassword,
    });
    await admin.save();

    console.log('\n✅ Admin user created successfully!');
    console.log('   Email: admin@ishyangaryera.com');
    console.log('   Password: admin123');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

createAdminUser();
