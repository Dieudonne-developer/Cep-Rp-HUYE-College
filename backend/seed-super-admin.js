const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const CepierUser = require('./models/CepierUser');
const { getMongoUri, getDbName } = require('./utils/mongoUri');
const ChoirUser = require('./models/UserRegistration');

const mongoUri = getMongoUri();
const dbName = getDbName();
mongoose.set('strictQuery', true);

async function createSuperAdmin() {
  try {
    await mongoose.connect(mongoUri, { dbName: dbName });
    console.log('✅ Connected to MongoDB');

    // Super Admin credentials
    // IMPORTANT: Super admin MUST be a CEPier family member
    const superAdminCredentials = {
      email: 'superadmin@cep.com',
      username: 'superadmin',
      password: 'SuperAdmin@2024',
      profileImage: null,
      isVerified: true,
      isApproved: true,
      approvedBy: 'system',
      approvedAt: new Date(),
      role: 'super-admin', // This is the key field for super admin
      adminGroup: 'cepier', // Super admin must be CEPier
      userGroup: 'cepier' // Super admin must be CEPier
    };

    // Check if super admin already exists in CepierUser collection
    let existingSuperAdmin = await CepierUser.findOne({ 
      $or: [
        { email: superAdminCredentials.email }, 
        { username: superAdminCredentials.username }
      ] 
    });

    // Also check UserRegistration for CEPier users
    if (!existingSuperAdmin) {
      existingSuperAdmin = await ChoirUser.findOne({
        $and: [
          {
            $or: [
              { email: superAdminCredentials.email }, 
              { username: superAdminCredentials.username }
            ]
          },
          {
            $or: [
              { adminGroup: 'cepier' },
              { userGroup: 'cepier' },
              { userGroup: 'choir', adminGroup: 'cepier' }
            ]
          }
        ]
      });
    }

    if (existingSuperAdmin) {
      console.log('⚠️  Super admin user already exists!');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Username: ${existingSuperAdmin.username}`);
      console.log(`   Role: ${existingSuperAdmin.role}`);
      console.log(`   Verified: ${existingSuperAdmin.isVerified}`);
      console.log(`   Approved: ${existingSuperAdmin.isApproved}`);
      console.log(`   Group: ${existingSuperAdmin.adminGroup || existingSuperAdmin.userGroup}`);
      
      // Check if it's already a super admin
      if (existingSuperAdmin.role === 'super-admin') {
        console.log('\n✅ This account is already a super admin!');
        // Verify it's a CEPier member
        const isCepier = existingSuperAdmin.adminGroup === 'cepier' || 
                        existingSuperAdmin.userGroup === 'cepier' ||
                        (existingSuperAdmin.userGroup === 'choir' && existingSuperAdmin.adminGroup === 'cepier');
        if (!isCepier) {
          console.log('\n⚠️  WARNING: This super admin is not a CEPier member!');
          console.log('   Super admins must be CEPier family members.');
          console.log('   Please update the adminGroup/userGroup to "cepier" in the database.');
        }
      } else {
        console.log('\n📝 To upgrade to super admin, update the role field in the database.');
        console.log('   Or delete this user and run the script again.');
      }
      
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(superAdminCredentials.password, 10);

    // Create super admin user in CepierUser collection (CEPier family)
    const superAdmin = new CepierUser({
      email: superAdminCredentials.email,
      username: superAdminCredentials.username,
      password: hashedPassword,
      profileImage: superAdminCredentials.profileImage,
      isVerified: superAdminCredentials.isVerified,
      isApproved: superAdminCredentials.isApproved,
      approvedBy: superAdminCredentials.approvedBy,
      approvedAt: superAdminCredentials.approvedAt,
      role: superAdminCredentials.role,
      adminGroup: superAdminCredentials.adminGroup,
      userGroup: superAdminCredentials.userGroup
    });

    await superAdmin.save();

    console.log('\n✅ Super admin user created successfully!');
    console.log('\n📋 Super Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${superAdminCredentials.email}`);
    console.log(`   Username: ${superAdminCredentials.username}`);
    console.log(`   Password: ${superAdminCredentials.password}`);
    console.log(`   Role:     ${superAdminCredentials.role}`);
    console.log(`   Group:    ${superAdminCredentials.adminGroup} (CEPier Family)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 IMPORTANT: Please change the password after first login!');
    console.log('\n📍 Login URL: http://localhost:5173/admin/login');
    console.log('   (or your deployed URL + /admin/login)');
    console.log('\n✨ Features available to Super Admin:');
    console.log('   - Create admin accounts for any group');
    console.log('   - View all admins across all groups');
    console.log('   - Suspend/Approve admin accounts');
    console.log('   - Delete admin accounts');
    console.log('   - Full access to "Manage Admins" page');
    console.log('   - Manage CEPier members approval');
    console.log('\n⚠️  NOTE: Super admin must be a CEPier family member!');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createSuperAdmin();


