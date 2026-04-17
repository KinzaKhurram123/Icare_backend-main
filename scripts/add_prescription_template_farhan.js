const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

const User = require('../models/user');
const PrescriptionTemplate = require('../models/prescriptionTemplate');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const doctor = await User.findOne({ email: 'farhan@gmail.com' });
  if (!doctor) { console.log('Doctor not found'); process.exit(1); }

  await PrescriptionTemplate.create({
    doctor: doctor._id,
    name: 'Hypertension Standard',
    medicines: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days' },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
    ]
  });

  await PrescriptionTemplate.create({
    doctor: doctor._id,
    name: 'Common Cold & Flu',
    medicines: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', duration: '5 days' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once at night', duration: '5 days' },
      { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
    ]
  });

  await PrescriptionTemplate.create({
    doctor: doctor._id,
    name: 'Diabetes Type 2',
    medicines: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: '90 days' },
      { name: 'Glibenclamide', dosage: '5mg', frequency: 'Once daily before breakfast', duration: '90 days' },
    ]
  });

  console.log('✅ 3 prescription templates added for farhan@gmail.com');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
