const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const CepierUser = require('./models/CepierUser');
const ChoirUser = require('./models/UserRegistration');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cep_database';
mongoose.set('strictQuery', true);

async function migrateSuperAdminToCepier() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const superAdminEmail = 'superadmin@cep.com';
    const superAdminUsername = 'superadmin';

    console.log('\n🔍 Searching for existing super admin...\n');

    // Check all possible locations
    let existingSuperAdmin = null;
    let foundIn = null;

    // Check CepierUser collection
    existingSuperAdmin = await CepierUser.findOne({
      $or: [
        { email: superAdminEmail },
        { username: superAdminUsername }
      ]
    });
    if (existingSuperAdmin) {
      foundIn = 'CepierUser';
    }

    // Check UserRegistration collection
    if (!existingSuperAdmin) {
      existingSuperAdmin = await ChoirUser.findOne({
        $or: [
          { email: superAdminEmail },
          { username: superAdminUsername }
        ]
      });
      if (existingSuperAdmin) {
        foundIn = 'UserRegistration';
      }
    }

    if (!existingSuperAdmin) {
      console.log('❌ Super admin not found. Please run seed-super-admin.js first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Found super admin in ${foundIn} collection:`);
    console.log(`   Email: ${existingSuperAdmin.email}`);
    console.log(`   Username: ${existingSuperAdmin.username}`);
    console.log(`   Role: ${existingSuperAdmin.role}`);
    console.log(`   Current adminGroup: ${existingSuperAdmin.adminGroup || 'not set'}`);
    console.log(`   Current userGroup: ${existingSuperAdmin.userGroup || 'not set'}`);

    // Check if already a CEPier member
    const isCepier = 
      existingSuperAdmin.adminGroup === 'cepier' || 
      existingSuperAdmin.userGroup === 'cepier' ||
      (existingSuperAdmin.userGroup === 'choir' && existingSuperAdmin.adminGroup === 'cepier') ||
      foundIn === 'CepierUser';

    if (isCepier && foundIn === 'CepierUser') {
      console.log('\n✅ Super admin is already a CEPier member in the correct collection!');
      console.log('   No migration needed.');
      await mongoose.disconnect();
      return;
    }

    console.log('\n🔄 Migrating super admin to CEPier...\n');

    // If in UserRegistration, we need to create in CepierUser and optionally delete from UserRegistration
    if (foundIn === 'UserRegistration') {
      // Check if already exists in CepierUser
      const existingInCepier = await CepierUser.findOne({
        $or: [
          { email: superAdminEmail },
          { username: superAdminUsername }
        ]
      });

      if (existingInCepier) {
        console.log('⚠️  Super admin already exists in CepierUser collection.');
        console.log('   Updating existing CepierUser record...');
        
        // Update existing CepierUser
        existingInCepier.role = 'super-admin';
        existingInCepier.adminGroup = 'cepier';
        existingInCepier.userGroup = 'cepier';
        existingInCepier.isVerified = existingSuperAdmin.isVerified || true;
        existingInCepier.isApproved = existingSuperAdmin.isApproved || true;
        if (existingSuperAdmin.password) {
          existingInCepier.password = existingSuperAdmin.password;
        }
        if (existingSuperAdmin.profileImage) {
          existingInCepier.profileImage = existingSuperAdmin.profileImage;
        }
        await existingInCepier.save();
        console.log('✅ Updated CepierUser record.');
      } else {
        // Create new in CepierUser
        const newCepierAdmin = new CepierUser({
          email: existingSuperAdmin.email,
          username: existingSuperAdmin.username,
          password: existingSuperAdmin.password,
          profileImage: existingSuperAdmin.profileImage,
          role: 'super-admin',
          adminGroup: 'cepier',
          userGroup: 'cepier',
          isVerified: existingSuperAdmin.isVerified || true,
          isApproved: existingSuperAdmin.isApproved || true,
          approvedBy: existingSuperAdmin.approvedBy || 'system',
          approvedAt: existingSuperAdmin.approvedAt || new Date()
        });
        await newCepierAdmin.save();
        console.log('✅ Created super admin in CepierUser collection.');
      }

      // Update UserRegistration record to be CEPier as well (for backward compatibility)
      existingSuperAdmin.adminGroup = 'cepier';
      existingSuperAdmin.userGroup = 'cepier';
      await existingSuperAdmin.save();
      console.log('✅ Updated UserRegistration record to CEPier.');
    } else if (foundIn === 'CepierUser') {
      // Already in CepierUser, just update groups if needed
      if (existingSuperAdmin.adminGroup !== 'cepier' || existingSuperAdmin.userGroup !== 'cepier') {
        existingSuperAdmin.adminGroup = 'cepier';
        existingSuperAdmin.userGroup = 'cepier';
        existingSuperAdmin.role = 'super-admin';
        await existingSuperAdmin.save();
        console.log('✅ Updated CepierUser record with correct groups.');
      }
    }

    // Verify the migration
    const verifiedAdmin = await CepierUser.findOne({
      $or: [
        { email: superAdminEmail },
        { username: superAdminUsername }
      ]
    });

    if (verifiedAdmin && verifiedAdmin.role === 'super-admin' && 
        (verifiedAdmin.adminGroup === 'cepier' || verifiedAdmin.userGroup === 'cepier')) {
      console.log('\n✅ Migration successful!');
      console.log('\n📋 Super Admin Status:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Email:    ${verifiedAdmin.email}`);
      console.log(`   Username: ${verifiedAdmin.username}`);
      console.log(`   Role:     ${verifiedAdmin.role}`);
      console.log(`   Group:    ${verifiedAdmin.adminGroup} (CEPier Family)`);
      console.log(`   Verified: ${verifiedAdmin.isVerified}`);
      console.log(`   Approved: ${verifiedAdmin.isApproved}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🔐 Credentials remain the same:');
      console.log('   Email: superadmin@cep.com');
      console.log('   Username: superadmin');
      console.log('   Password: SuperAdmin@2024');
      console.log('\n📍 Login URL: http://localhost:5173/admin/login');
    } else {
      console.log('\n⚠️  Migration completed but verification failed. Please check manually.');
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error migrating super admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the migration
migrateSuperAdminToCepier();






