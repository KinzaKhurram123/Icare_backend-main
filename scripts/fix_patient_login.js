require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const patient = await User.findOne({ email: 'patient@gmail.com' });
  if (!patient) { console.log('Not found'); process.exit(1); }
  
  console.log('Before - verified:', patient.isEmailVerified, 'role:', patient.role);
  
  // Reset password and ensure verified
  patient.password = await bcrypt.hash('patient1', 10);
  patient.isEmailVerified = true;
  patient.isApproved = true;
  patient.role = 'Patient';
  await patient.save();
  
  console.log('✅ Fixed: patient@gmail.com / patient1');
  console.log('After - verified:', patient.isEmailVerified, 'role:', patient.role);
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
