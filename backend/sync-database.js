/**
 * Sync local MongoDB data to Railway MongoDB (cep-app-database)
 *
 * Usage:
 *   # Optional overrides
 *   $env:MONGODB_URI_SOURCE="mongodb://localhost:27017/cep_database"
 *   $env:MONGODB_URI_TARGET="mongodb://mongo:USER:PASS@gondola.proxy.rlwy.net:30232/cep-app-database"
 *   node sync-database.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const DEFAULT_SOURCE_URI = 'mongodb://localhost:27017/cep_database';
const DEFAULT_TARGET_URI = 'mongodb://mongo:UWxIyLcLqSLzUskMheYBSwdzqXjHYate@gondola.proxy.rlwy.net:30232/cep-app-database';

const sourceUri = process.env.MONGODB_URI_SOURCE || DEFAULT_SOURCE_URI;
const targetUri = process.env.MONGODB_URI_TARGET || process.env.MONGODB_URI || DEFAULT_TARGET_URI;

function extractDbName(uri, fallback) {
  if (!uri) return fallback;
  const match = uri.match(/\/([^\/\?]+)(\?|$)/);
  if (match && match[1] && !match[1].includes('@')) {
    return match[1];
  }
  return fallback;
}

function sanitizeUri(uri) {
  if (!uri) return uri;
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

function ensureDbSuffix(uri, dbName) {
  if (!uri) return uri;
  const hasDb = uri.match(/\/([^\/\?]+)(\?|$)/);
  if (hasDb && hasDb[1] && !hasDb[1].includes('@')) {
    return uri; // already has db
  }
  if (!dbName) return uri;
  const hasQuery = uri.includes('?');
  if (hasQuery) {
    const [base, query] = uri.split('?');
    return `${base}/${dbName}?${query}`;
  }
  return `${uri}/${dbName}`;
}

const sourceDbName = process.env.MONGODB_DB_SOURCE || extractDbName(sourceUri, 'cep_database');
const targetDbName = process.env.MONGODB_DB_TARGET || extractDbName(targetUri, 'cep-app-database');

const normalizedSourceUri = ensureDbSuffix(sourceUri, sourceDbName);
const normalizedTargetUri = ensureDbSuffix(targetUri, targetDbName);

const chunkSize = 1000;

async function copyCollection(sourceDb, targetDb, collectionName) {
  const sourceCollection = sourceDb.collection(collectionName);
  const targetCollection = targetDb.collection(collectionName);

  const count = await sourceCollection.countDocuments();
  console.log(`\n📦 Collection: ${collectionName}`);
  console.log(`   Total documents: ${count}`);

  if (count === 0) {
    console.log('   Skipping (no documents)');
    await targetCollection.deleteMany({});
    return;
  }

  console.log('   Clearing target collection...');
  await targetCollection.deleteMany({});

  const cursor = sourceCollection.find({});
  let batch = [];
  let inserted = 0;

  while (await cursor.hasNext()) {
    batch.push(await cursor.next());
    if (batch.length === chunkSize) {
      await targetCollection.insertMany(batch);
      inserted += batch.length;
      console.log(`   Inserted ${inserted}/${count}`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await targetCollection.insertMany(batch);
    inserted += batch.length;
    console.log(`   Inserted ${inserted}/${count}`);
  }

  console.log(`   ✅ Synced ${collectionName}`);
}

async function run() {
  console.log('🚀 Syncing MongoDB data to Railway');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔸 Source URI:', sanitizeUri(normalizedSourceUri));
  console.log('🔸 Source DB: ', sourceDbName);
  console.log('🔸 Target URI:', sanitizeUri(normalizedTargetUri));
  console.log('🔸 Target DB: ', targetDbName);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const sourceClient = new MongoClient(normalizedSourceUri);
  const targetClient = new MongoClient(normalizedTargetUri);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db(sourceDbName);
    const targetDb = targetClient.db(targetDbName);

    console.log('✅ Connected to both databases');

    const collections = await sourceDb.listCollections().toArray();
    const filteredCollections = collections
      .map(col => col.name)
      .filter(name => !name.startsWith('system.'));

    console.log(`📚 Collections to sync: ${filteredCollections.length}`);

    for (const collectionName of filteredCollections) {
      await copyCollection(sourceDb, targetDb, collectionName);
    }

    console.log('\n✅ Sync complete!');
    console.log('All collections have been copied to Railway.');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exitCode = 1;
  } finally {
    await sourceClient.close();
    await targetClient.close();
    console.log('\n🔌 Connections closed');
  }
}

run();


