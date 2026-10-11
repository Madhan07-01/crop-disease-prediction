const mongoose = require('mongoose');
require('dotenv').config();

async function showDb() {
  const uri = process.env.MONGO_URI;
  console.log('Connecting to:', uri.replace(/:([^:@]+)@/, ':****@'));
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();
  console.log('\n=============================================');
  console.log('  DATABASE:', mongoose.connection.name);
  console.log('  COLLECTIONS COUNT:', cols.length);
  console.log('=============================================\n');

  for (const c of cols) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`\n📁 Collection: "${c.name}" [${count} documents]`);
    const samples = await db.collection(c.name).find().limit(2).toArray();
    console.log(JSON.stringify(samples, null, 2));
  }
  await mongoose.disconnect();
  process.exit(0);
}

showDb().catch(e => {
  console.error('Error connecting to database:', e.message);
  process.exit(1);
});
