require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/user');
const Pharmacy = require('../models/pharmacy');
const Medicine = require('../models/medicine');

const medicines = [
  // Pain Relief
  { productName: 'Panadol Extra 500mg', companyName: 'GSK', brand: 'Panadol', category: 'Pain Relief', medicineType: 'Tablet', power: '500mg', details: 'Fast-acting paracetamol for pain and fever.', precautions: 'Max 8 tablets/day. Avoid alcohol.', price: 120, amount: '20 tablets', quantity: 200 },
  { productName: 'Brufen 400mg', companyName: 'Abbott', brand: 'Brufen', category: 'Pain Relief', medicineType: 'Tablet', power: '400mg', details: 'Ibuprofen for pain, inflammation and fever.', precautions: 'Take with food. Avoid if stomach ulcer.', price: 95, amount: '10 tablets', quantity: 150 },
  { productName: 'Voltaren Gel 1%', companyName: 'Novartis', brand: 'Voltaren', category: 'Pain Relief', medicineType: 'Gel', power: '1%', details: 'Topical diclofenac for joint and muscle pain.', precautions: 'External use only. Avoid eyes.', price: 350, amount: '50g tube', quantity: 60 },

  // Antibiotics
  { productName: 'Amoxil 500mg', companyName: 'GSK', brand: 'Amoxil', category: 'Antibiotic', medicineType: 'Capsule', power: '500mg', details: 'Amoxicillin for bacterial infections.', precautions: 'Complete full course. Check for penicillin allergy.', price: 180, amount: '14 capsules', quantity: 100 },
  { productName: 'Augmentin 625mg', companyName: 'GSK', brand: 'Augmentin', category: 'Antibiotic', medicineType: 'Tablet', power: '625mg', details: 'Amoxicillin + Clavulanate for resistant infections.', precautions: 'Take with meals. Complete full course.', price: 420, amount: '14 tablets', quantity: 80 },
  { productName: 'Ciprofloxacin 500mg', companyName: 'Bayer', brand: 'Cipro', category: 'Antibiotic', medicineType: 'Tablet', power: '500mg', details: 'Broad-spectrum antibiotic for UTI and respiratory infections.', precautions: 'Avoid dairy products. Stay hydrated.', price: 260, amount: '10 tablets', quantity: 90 },

  // Diabetes
  { productName: 'Metformin 500mg', companyName: 'Sanofi', brand: 'Glucophage', category: 'Diabetes', medicineType: 'Tablet', power: '500mg', details: 'Controls blood sugar in type 2 diabetes.', precautions: 'Take with meals. Monitor blood sugar.', price: 210, amount: '30 tablets', quantity: 80 },
  { productName: 'Glibenclamide 5mg', companyName: 'Roche', brand: 'Daonil', category: 'Diabetes', medicineType: 'Tablet', power: '5mg', details: 'Sulfonylurea for type 2 diabetes management.', precautions: 'Monitor for hypoglycemia. Take before meals.', price: 150, amount: '30 tablets', quantity: 70 },

  // Cholesterol & Heart
  { productName: 'Atorvastatin 20mg', companyName: 'Pfizer', brand: 'Lipitor', category: 'Cholesterol', medicineType: 'Tablet', power: '20mg', details: 'Lowers LDL cholesterol and reduces heart disease risk.', precautions: 'Avoid grapefruit. Report muscle pain.', price: 350, amount: '30 tablets', quantity: 60 },
  { productName: 'Aspirin 75mg', companyName: 'Bayer', brand: 'Aspirin', category: 'Heart', medicineType: 'Tablet', power: '75mg', details: 'Low-dose aspirin for heart attack and stroke prevention.', precautions: 'Take with food. Not for children under 16.', price: 80, amount: '30 tablets', quantity: 120 },

  // Gastric
  { productName: 'Omeprazole 20mg', companyName: 'AstraZeneca', brand: 'Losec', category: 'Gastric', medicineType: 'Capsule', power: '20mg', details: 'Proton pump inhibitor for acid reflux and ulcers.', precautions: 'Take 30 min before meals.', price: 160, amount: '14 capsules', quantity: 120 },
  { productName: 'Gaviscon Liquid', companyName: 'Reckitt', brand: 'Gaviscon', category: 'Gastric', medicineType: 'Syrup', power: '150ml', details: 'Antacid for heartburn and indigestion relief.', precautions: 'Shake well before use. After meals.', price: 280, amount: '150ml', quantity: 50 },

  // Allergy
  { productName: 'Cetirizine 10mg', companyName: 'UCB', brand: 'Zyrtec', category: 'Allergy', medicineType: 'Tablet', power: '10mg', details: 'Antihistamine for allergies and hay fever.', precautions: 'May cause drowsiness. Avoid driving.', price: 75, amount: '10 tablets', quantity: 180 },
  { productName: 'Loratadine 10mg', companyName: 'Schering', brand: 'Claritin', category: 'Allergy', medicineType: 'Tablet', power: '10mg', details: 'Non-drowsy antihistamine for allergy relief.', precautions: 'Once daily. Safe for daytime use.', price: 90, amount: '10 tablets', quantity: 150 },

  // Vitamins & Supplements
  { productName: 'Vitamin D3 1000IU', companyName: 'Nutrifactor', brand: 'Nutrifactor', category: 'Vitamins', medicineType: 'Tablet', power: '1000IU', details: 'Supports bone health and immune function.', precautions: 'Do not exceed recommended dose.', price: 450, amount: '60 tablets', quantity: 90 },
  { productName: 'Vitamin C 500mg', companyName: 'VitaHealth', brand: 'VitaHealth', category: 'Vitamins', medicineType: 'Tablet', power: '500mg', details: 'Antioxidant for immune support and skin health.', precautions: 'High doses may cause stomach upset.', price: 200, amount: '30 tablets', quantity: 100 },
  { productName: 'Zinc 50mg', companyName: 'Nutrifactor', brand: 'Nutrifactor', category: 'Vitamins', medicineType: 'Tablet', power: '50mg', details: 'Essential mineral for immunity and wound healing.', precautions: 'Take with food to avoid nausea.', price: 180, amount: '30 tablets', quantity: 80 },

  // Blood Pressure
  { productName: 'Amlodipine 5mg', companyName: 'Pfizer', brand: 'Norvasc', category: 'Blood Pressure', medicineType: 'Tablet', power: '5mg', details: 'Calcium channel blocker for hypertension.', precautions: 'Do not stop suddenly. Monitor BP regularly.', price: 190, amount: '30 tablets', quantity: 70 },
  { productName: 'Losartan 50mg', companyName: 'Merck', brand: 'Cozaar', category: 'Blood Pressure', medicineType: 'Tablet', power: '50mg', details: 'ARB for high blood pressure and kidney protection.', precautions: 'Avoid potassium supplements. Monitor kidney function.', price: 240, amount: '30 tablets', quantity: 65 },

  // Cough & Cold
  { productName: 'Actifed Syrup', companyName: 'GSK', brand: 'Actifed', category: 'Cough & Cold', medicineType: 'Syrup', power: '100ml', details: 'Decongestant and antihistamine for cold symptoms.', precautions: 'May cause drowsiness. Avoid alcohol.', price: 220, amount: '100ml', quantity: 55 },
  { productName: 'Robitussin DM', companyName: 'Pfizer', brand: 'Robitussin', category: 'Cough & Cold', medicineType: 'Syrup', power: '100ml', details: 'Cough suppressant and expectorant.', precautions: 'Do not exceed recommended dose.', price: 195, amount: '100ml', quantity: 60 },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const user = await User.findOne({ email: 'pharmacy@icare.com' });
  if (!user) { console.log('❌ Pharmacy user not found. Run create_pharmacy_user.js first.'); return; }

  const pharmacy = await Pharmacy.findOne({ user: user._id });
  if (!pharmacy) { console.log('❌ Pharmacy profile not found.'); return; }

  console.log(`📦 Adding medicines to pharmacy: ${pharmacy.ownerName}`);

  let added = 0;
  const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  for (const med of medicines) {
    const exists = await Medicine.findOne({ pharmacy: pharmacy._id, productName: med.productName });
    if (!exists) {
      await Medicine.create({ ...med, pharmacy: pharmacy._id, expiry, deliveryOption: 'both', isAvailable: true });
      console.log(`  ✅ ${med.productName}`);
      added++;
    } else {
      console.log(`  ⏭️  Already exists: ${med.productName}`);
    }
  }

  const total = await Medicine.countDocuments({ pharmacy: pharmacy._id });
  console.log(`\n🎉 Added ${added} new medicines. Total: ${total}`);
  await mongoose.disconnect();
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
