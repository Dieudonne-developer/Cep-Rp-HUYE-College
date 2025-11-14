/**
 * Script to update all seed scripts to use dbName in connection options
 * This ensures all scripts connect to cep-app-database on Railway
 */

const fs = require('fs');
const path = require('path');

const seedScripts = [
  'seed-all-admins.js',
  'seed-super-admin.js',
  'seed-admin.js',
  'seed.js',
  'seed-choir-admin.js',
  'seed-anointed-admin.js',
  'seed-abanyamugisha-admin.js',
  'seed-psalm23-admin.js',
  'seed-psalm46-admin.js',
  'seed-protocol-admin.js',
  'seed-social-admin.js',
  'seed-evangelical-admin.js',
  'migrate-super-admin-to-cepier.js',
  'backfill-groups.js',
  'create_sample_data.js',
  'connect-railway-db.js',
  'setup-railway-database.js'
];

console.log('Updating seed scripts to use dbName in connection options...\n');

seedScripts.forEach(script => {
  const filePath = path.join(__dirname, script);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${script} - File not found, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Update import to include getDbName
  if (content.includes("const { getMongoUri } = require('./utils/mongoUri')") && 
      !content.includes("getDbName")) {
    content = content.replace(
      "const { getMongoUri } = require('./utils/mongoUri')",
      "const { getMongoUri, getDbName } = require('./utils/mongoUri')"
    );
    updated = true;
  }

  // Add dbName variable if getMongoUri is used
  if (content.includes('const mongoUri = getMongoUri()') && 
      !content.includes('const dbName = getDbName()')) {
    content = content.replace(
      /const mongoUri = getMongoUri\(\);/g,
      "const mongoUri = getMongoUri();\nconst dbName = getDbName();"
    );
    updated = true;
  }

  // Update mongoose.connect calls
  if (content.includes('mongoose.connect(mongoUri)') && 
      !content.includes('mongoose.connect(mongoUri, { dbName')) {
    content = content.replace(
      /await mongoose\.connect\(mongoUri\);/g,
      "await mongoose.connect(mongoUri, { dbName: dbName });"
    );
    content = content.replace(
      /mongoose\.connect\(mongoUri\);/g,
      "mongoose.connect(mongoUri, { dbName: dbName });"
    );
    updated = true;
  }

  // Update getMongoUri() direct calls
  if (content.includes('mongoose.connect(getMongoUri())') && 
      !content.includes('getDbName')) {
    content = content.replace(
      /await mongoose\.connect\(getMongoUri\(\)\);/g,
      "const dbName = getDbName();\n    await mongoose.connect(getMongoUri(), { dbName: dbName });"
    );
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${script}`);
  } else {
    console.log(`⏭️  ${script} - No changes needed`);
  }
});

console.log('\n✅ All seed scripts updated!');

