require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/user');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB:', process.env.MONGO_URI.split('@')[1]);
  const users = await User.find({}, 'email role isApproved').sort({ createdAt: -1 }).limit(15);
  console.log('\nUsers in DB:');
  users.forEach(u => console.log(' ', u.email, '|', u.role, '| approved:', u.isApproved));
  await mongoose.disconnect();
}
run().catch(e => console.error(e.message));
