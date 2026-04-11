require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/user');
const Pharmacy = require('../models/pharmacy');
const Medicine = require('../models/medicine');

const medicines = [
  { productName: 'Panadol Extra 500mg', companyName: 'GSK', brand: 'Panadol', category: 'Pain Relief', medicineType: 'Tablet', power: '500mg', details: 'Fast-acting paracetamol for pain and fever.', precautions: 'Max 8 tablets/day.', price: 120, amount: '20 tablets', quantity: 200 },
  { productName: 'Brufen 400mg', companyName: 'Abbott', brand: 'Brufen', category: 'Pain Relief', medicineType: 'Tablet', power: '400mg', details: 'Ibuprofen for pain and inflammation.', precautions: 'Take with food.', price: 95, amount: '10 tablets', quantity: 150 },
  { productName: 'Amoxil 500mg', companyName: 'GSK', brand: 'Amoxil', category: 'Antibiotic', medicineType: 'Capsule', power: '500mg', details: 'Amoxicillin for bacterial infections.', precautions: 'Complete full course.', price: 180, amount: '14 capsules', quantity: 100 },
  { productName: 'Augmentin 625mg', companyName: 'GSK', brand: 'Augmentin', category: 'Antibiotic', medicineType: 'Tablet', power: '625mg', details: 'Amoxicillin + Clavulanate for resistant infections.', precautions: 'Take with meals.', price: 420, amount: '14 tablets', quantity: 80 },
  { productName: 'Metformin 500mg', companyName: 'Sanofi', brand: 'Glucophage', category: 'Diabetes', medicineType: 'Tablet', power: '500mg', details: 'Controls blood sugar in type 2 diabetes.', precautions: 'Take with meals.', price: 210, amount: '30 tablets', quantity: 80 },
  { productName: 'Atorvastatin 20mg', companyName: 'Pfizer', brand: 'Lipitor', category: 'Cholesterol', medicineType: 'Tablet', power: '20mg', details: 'Lowers LDL cholesterol.', precautions: 'Avoid grapefruit.', price: 350, amount: '30 tablets', quantity: 60 },
  { productName: 'Omeprazole 20mg', companyName: 'AstraZeneca', brand: 'Losec', category: 'Gastric', medicineType: 'Capsule', power: '20mg', details: 'Proton pump inhibitor for acid reflux.', precautions: 'Take 30 min before meals.', price: 160, amount: '14 capsules', quantity: 120 },
  { productName: 'Cetirizine 10mg', companyName: 'UCB', brand: 'Zyrtec', category: 'Allergy', medicineType: 'Tablet', power: '10mg', details: 'Antihistamine for allergies.', precautions: 'May cause drowsiness.', price: 75, amount: '10 tablets', quantity: 180 },
  { productName: 'Vitamin D3 1000IU', companyName: 'Nutrifactor', brand: 'Nutrifactor', category: 'Vitamins', medicineType: 'Tablet', power: '1000IU', details: 'Supports bone health and immunity.', precautions: 'Do not exceed dose.', price: 450, amount: '60 tablets', quantity: 90 },
  { productName: 'Amlodipine 5mg', companyName: 'Pfizer', brand: 'Norvasc', category: 'Blood Pressure', medicineType: 'Tablet', power: '5mg', details: 'Calcium channel blocker for hypertension.', precautions: 'Monitor BP regularly.', price: 190, amount: '30 tablets', quantity: 70 },
  { productName: 'Aspirin 75mg', companyName: 'Bayer', brand: 'Aspirin', category: 'Heart', medicineType: 'Tablet', power: '75mg', details: 'Low-dose aspirin for heart protection.', precautions: 'Take with food.', price: 80, amount: '30 tablets', quantity: 120 },
  { productName: 'Ciprofloxacin 500mg', companyName: 'Bayer', brand: 'Cipro', category: 'Antibiotic', medicineType: 'Tablet', power: '500mg', details: 'Broad-spectrum antibiotic.', precautions: 'Stay hydrated.', price: 260, amount: '10 tablets', quantity: 90 },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected');

  const user = await User.findOne({ email: 'pharma@gmail.com' });
  if (!user) { console.log('❌ User not found'); return; }

  let pharmacy = await Pharmacy.findOne({ user: user._id });
  if (!pharmacy) {
    pharmacy = await Pharmacy.create({
      user: user._id,
      ownerName: 'Pharma Pharmacy',
      cnic: '42101-9876543-2',
      licenseNumber: 'PH-2024-002',
      city: 'Lahore',
      address: '456 Medicine Street, Lahore',
      phone: '+923009876543',
      isVerified: true,
    });
    console.log('✅ Created pharmacy profile for pharma@gmail.com');
  } else {
    console.log('ℹ️  Pharmacy profile exists');
  }

  const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  let added = 0;
  for (const med of medicines) {
    const exists = await Medicine.findOne({ pharmacy: pharmacy._id, productName: med.productName });
    if (!exists) {
      await Medicine.create({ ...med, pharmacy: pharmacy._id, expiry, deliveryOption: 'both', isAvailable: true });
      console.log(`  ✅ ${med.productName}`);
      added++;
    }
  }

  const total = await Medicine.countDocuments({ pharmacy: pharmacy._id });
  console.log(`\n🎉 Added ${added} medicines. Total: ${total}`);
  await mongoose.disconnect();
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
