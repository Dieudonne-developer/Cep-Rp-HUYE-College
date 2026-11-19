const bcrypt = require('bcryptjs');

async function ensureAdmin(UserModel, { email, username, password, role = 'admin', group }) {
  const emailLower = email.toLowerCase();
  const existing = await UserModel.findOne({ email: emailLower });

  if (existing) {
    existing.password = await bcrypt.hash(password, 10);
    existing.isVerified = true;
    existing.isApproved = true;
    existing.role = role;
    existing.adminGroup = group;
    existing.userGroup = group;
    await existing.save();
    console.log(`✅ Reset ${group} ${role}: ${emailLower}`);
    return existing;
  }

  const sameUsername = await UserModel.findOne({ username });
  if (sameUsername) {
    console.log(`⚠️  Username ${username} already used by ${sameUsername.email}; left it unchanged`);
    return sameUsername;
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
