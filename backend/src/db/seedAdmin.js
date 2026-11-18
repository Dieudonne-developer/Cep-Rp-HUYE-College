const bcrypt = require('bcryptjs');

async function ensureAdmin(UserModel, { email, username, password, role = 'admin', group }) {
  const emailLower = email.toLowerCase();
  const existing = await UserModel.findOne({
    $or: [{ email: emailLower }, { username }],
  });

  if (existing) {
    console.log(`⚠️  ${group} admin already exists: ${existing.email}`);
    return existing;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new UserModel({
    email: emailLower,
    username,
    password: hashedPassword,
    isVerified: true,
    isApproved: true,
    approvedBy: 'system',
    approvedAt: new Date(),
    role,
    adminGroup: group,
    userGroup: group,
  });
  await user.save();
  console.log(`✅ Created ${group} ${role}: ${emailLower}`);
  return user;
}

module.exports = { ensureAdmin };
