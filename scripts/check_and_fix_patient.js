require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const patient = await User.findOne({ email: 'patient@gmail.com' });
  console.log('isApproved:', patient.isApproved, '| isEmailVerified:', patient.isEmailVerified);
  
  patient.isApproved = true;
  patient.isEmailVerified = true;
  patient.password = await bcrypt.hash('patient1', 10);
  await patient.save();
  
  console.log('✅ Fixed — patient@gmail.com / patient1 — isApproved: true');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
