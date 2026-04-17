require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const patient = await User.findOne({ email: 'patient@gmail.com' });
  if (!patient) { console.log('Not found'); process.exit(1); }

  // Try the original password from the context — it was 0300000 (phone number)
  // Reset to a known simple password
  patient.password = await bcrypt.hash('patient123', 10);
  patient.isApproved = true;
  patient.isEmailVerified = true;
  await patient.save();

  console.log('✅ patient@gmail.com password reset to: patient123');
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
