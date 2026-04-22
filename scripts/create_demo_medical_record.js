require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const MedicalRecord = require('../models/medicalRecord');
const Appointment = require('../models/appointment');
const Laboratory = require('../models/laboratory');
const LabBooking = require('../models/labBooking');
const Notification = require('../models/notification');





mongoose.connect(process.env.MONGO_URI).then(async () => {

  // 1. Ensure patient@gmail.com exists
  let patient = await User.findOne({ email: 'patient@gmail.com' });
  if (!patient) {
    const hash = await bcrypt.hash('patient1', 10);
    patient = await User.create({
      name: 'patient',
      email: 'patient@gmail.com',
      password: hash,
      phoneNumber: '0300000',
      role: 'Patient',
      isEmailVerified: true,
    });
    console.log('✅ Created patient@gmail.com');
  } else {
    // Update password to patient1
    patient.password = await bcrypt.hash('patient1', 10);
    await patient.save();
    console.log('✅ patient@gmail.com exists, password reset to patient1');
  }

  // 2. Get doctor (farhan)
  const doctor = await User.findOne({ email: 'farhan@gmail.com' });
  if (!doctor) { console.log('❌ Doctor not found'); process.exit(1); }

  // 3. Get or find a lab
  let lab = await Laboratory.findOne({});
  if (!lab) { console.log('❌ No lab found — run add_test_laboratory.js first'); process.exit(1); }
  console.log('✅ Using lab:', lab.labName);

  // 4. Get an existing appointment between farhan and patient
  let appointment = await Appointment.findOne({
    doctor: doctor._id,
    patient: patient._id,
  });

  if (!appointment) {
    appointment = await Appointment.create({
      doctor: doctor._id,
      patient: patient._id,
      date: new Date(),
      timeSlot: '10:00 AM',
      status: 'completed',
    });
    console.log('✅ Created appointment');
  }

  // 5. Create medical record with lab tests + prescription
  const record = await MedicalRecord.create({
    patient: patient._id,
    doctor: doctor._id,
    appointment: appointment._id,
    diagnosis: 'Type 2 Diabetes Mellitus with Hypertension',
    symptoms: ['Increased thirst', 'Frequent urination', 'Headache', 'Fatigue'],
    prescription: {
      medicines: [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', duration: '90 days', instructions: 'Take after food' },
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take in the morning' },
        { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '90 days', instructions: 'Take after breakfast' },
      ],
      notes: 'Monitor blood pressure daily. Follow low-sodium diet.',
    },
    labTests: ['HbA1c', 'Fasting Blood Sugar', 'Complete Blood Count', 'Lipid Profile', 'Kidney Function Test'],
    vitalSigns: {
      bloodPressure: '145/90 mmHg',
      temperature: '98.6°F',
      heartRate: '82 bpm',
      weight: '85 kg',
      height: '170 cm',
    },
    notes: 'Patient advised to follow diabetic diet. Reduce salt intake. Exercise 30 minutes daily. Follow up in 4 weeks.',
    followUpDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    referredLaboratory: lab._id,
  });
  console.log('✅ Medical record created');

  // 6. Create lab booking (auto-created by backend normally, doing manually here)
  const makeBookingNumber = () => `LAB-REF-${Date.now().toString().slice(-6)}-DEMO`;
  const labBooking = await LabBooking.create({
    laboratory: lab._id,
    patient: patient._id,
    testName: 'HbA1c, Fasting Blood Sugar, CBC, Lipid Profile, Kidney Function Test',
    medicalRecord: record._id,
    bookingNumber: makeBookingNumber(),
    status: 'pending',
    doctor: doctor._id,
    date: new Date(),
    price: 2500,
    diagnosisNotes: 'Type 2 Diabetes Mellitus with Hypertension',
  });
  console.log('✅ Lab booking created:', labBooking.bookingNumber);

  // 7. Notify patient
  await Notification.create({
    user: patient._id,
    title: 'Lab Tests Ordered by Dr. farhan',
    message: `Your doctor has ordered lab tests: HbA1c, Fasting Blood Sugar, CBC, Lipid Profile, Kidney Function Test. Please visit ${lab.labName} to complete them.`,
    type: 'general',
    relatedId: record._id,
    relatedModel: 'MedicalRecord',
  });

  if (lab.user) {
    await Notification.create({
      user: lab.user,
      title: 'New Lab Test Order from Dr. farhan',
      message: `Dr. farhan has ordered lab tests for patient: ${labBooking.testName}`,
      type: 'general',
    });
  }

  // 9. Create doctor-assigned reminders for medicines
  const Reminder = require('../models/reminder');
  const medicines = record.prescription.medicines;
  for (const med of medicines) {
    await Reminder.create({
      patient: patient._id,
      patientEmail: patient.email,
      patientName: patient.name,
      title: `Take ${med.name}`,
      disease: 'Type 2 Diabetes Mellitus with Hypertension',
      tablets: [med.name],
      instructions: `${med.dosage} — ${med.frequency} — ${med.duration}`,
      time: '08:00',
      date: new Date(),
      prescription: med,
      createdBy: doctor._id,
    });
  }
  console.log('✅ 3 doctor-assigned reminders created for patient');

  console.log('\n📋 SUMMARY:');
  console.log('Patient login: patient@gmail.com / patient1');
  console.log('Doctor login:  farhan@gmail.com / farhan1');
  console.log('\nWhat patient will see:');
  console.log('  - Medical Records: Diagnosis + Prescription + Lab Tests');
  console.log('  - Reminders: 3 doctor-assigned medicine reminders');
  console.log('  - Notifications: Lab tests ordered notification');
  console.log('  - Book a Lab Test: HbA1c etc. pre-selected in Step 2');
  console.log('\nWhat lab will see:');
  console.log('  - Lab Bookings: New pending booking from Dr. farhan');
  console.log('  - Notification: New lab order');

  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
