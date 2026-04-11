require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Pharmacy = require('../models/pharmacy');
const Medicine = require('../models/medicine');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const email = 'pharmacy@icare.com';
  let user = await User.findOne({ email });

  if (!user) {
    const hash = await bcrypt.hash('Pharmacy@123', 10);
    user = await User.create({
      name: 'iCare Pharmacy',
      email,
      password: hash,
      role: 'Pharmacy',
      phoneNumber: '+923001234567',
      isApproved: true,
      isEmailVerified: true,
    });
    console.log('✅ Created user:', email);
  } else {
    // Make sure existing user is approved
    if (!user.isApproved) {
      user.isApproved = true;
      user.isEmailVerified = true;
      await user.save();
      console.log('✅ Approved existing user:', email);
    } else {
      console.log('ℹ️  User already exists and is approved:', email);
    }
  }

  let pharmacy = await Pharmacy.findOne({ user: user._id });
  if (!pharmacy) {
    pharmacy = await Pharmacy.create({
      user: user._id,
      ownerName: 'iCare Pharmacy',
      cnic: '42101-1234567-1',
      licenseNumber: 'PH-2024-001',
      city: 'Karachi',
      address: '123 Health Street, Karachi',
      phone: '+923001234567',
      isVerified: true,
    });
    console.log('✅ Created pharmacy profile');
  } else {
    console.log('ℹ️  Pharmacy profile already exists');
  }

  // Re-link any orphaned medicines to this pharmacy
  const existing = await Medicine.countDocuments({ pharmacy: pharmacy._id });
  if (existing === 0) {
    // Link medicines that have no pharmacy or belong to old pharmacy
    const updated = await Medicine.updateMany(
      { pharmacy: { $exists: false } },
      { $set: { pharmacy: pharmacy._id } }
    );
    console.log('🔗 Linked orphaned medicines:', updated.modifiedCount);
  } else {
    console.log('💊 Medicines already linked:', existing);
  }

  console.log('\n=============================');
  console.log('  PHARMACY LOGIN CREDENTIALS');
  console.log('=============================');
  console.log('  Email   : pharmacy@icare.com');
  console.log('  Password: Pharmacy@123');
  console.log('  Role    : Pharmacy');
  console.log('=============================\n');

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
