/**
 * seed_anwar_demo.js
 *
 * Seeds a complete doctor-creates-medical-record-with-lab-referral flow for anwar@gmail.com.
 *
 * What this creates (or reuses if already existing):
 *  1. Patient user  → anwar@gmail.com           (role: Patient)
 *  2. Patient profile record
 *  3. Demo doctor   → demo.doctor@icare.com     (role: Doctor)
 *  4. Demo lab      → demolab@icare.com          (role: Laboratory)
 *  5. Laboratory profile for the demo lab
 *  6. MedicalRecord → doctor prescribed CBC, Lipid Panel, Blood Sugar
 *                     referring the demo lab
 *  7. LabBooking    → status: pending, linked to MedicalRecord
 *  8. Notification  → to lab:     "New Lab Test Order from Doctor"
 *  9. Notification  → to patient: "Lab Tests Ordered"
 *
 * Run:  node seed_anwar_demo.js
 */





const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();





// ── Models ────────────────────────────────────────────────────────────────────
const User = require('./models/user');
const Patient = require('./models/patient');
const Doctor = require('./models/doctor');
const Laboratory = require('./models/laboratory');
const MedicalRecord = require('./models/medicalRecord');
const LabBooking = require('./models/labBooking');
const Notification = require('./models/notification');






// ── Helpers ───────────────────────────────────────────────────────────────────
const makeBookingNumber = () => {
    const part = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `LAB-REF-${Date.now().toString().slice(-6)}-${part}`;
};

async function findOrCreate(Model, query, data) {
    let doc = await Model.findOne(query);
    if (!doc) {
        doc = await Model.create(data);
        console.log(`  ✅ Created: ${JSON.stringify(query)}`);
    } else {
        console.log(`  ♻️  Reusing: ${JSON.stringify(query)}`);
    }
    return doc;
}






// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n🌱 Connected to MongoDB →', process.env.MONGO_URI.split('@')[1]);

    const hashedPassword = await bcrypt.hash('password123', 10);




    // ── 1. Patient User ──────────────────────────────────────────────────────
    console.log('\n[1/9] Patient user (anwar@gmail.com)');
    const patientUser = await findOrCreate(
        User,
        { email: 'anwar@gmail.com' },
        {
            name: 'Anwar Ahmed',
            email: 'anwar@gmail.com',
            password: hashedPassword,
            role: 'Patient',
            phoneNumber: '+92-300-1234567',
            isEmailVerified: true,
            isApproved: true,
        }
    );

    // ── 2. Patient Profile ───────────────────────────────────────────────────
    console.log('\n[2/9] Patient profile record');
    await findOrCreate(
        Patient,
        { user: patientUser._id },
        {
            user: patientUser._id,
            gender: 'Male',
            dateOfBirth: new Date('1988-04-12'),
            bloodGroup: 'B+',
            cnic: '35201-1234567-1',
            address: 'House 12, Street 5, Lahore, Pakistan',
            allergies: ['Penicillin', 'Sulfa drugs'],
            medicalConditions: ['Type 2 Diabetes', 'Hypertension'],
            currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
            emergencyContact: { name: 'Bilal Ahmed', phone: '+92-300-9876543', relation: 'Brother' },
            height: 172,
            weight: 78,
        }
    );

    // ── 3. Doctor User ───────────────────────────────────────────────────────
    console.log('\n[3/9] Demo doctor user (demo.doctor@icare.com)');
    const doctorUser = await findOrCreate(
        User,
        { email: 'demo.doctor@icare.com' },
        {
            name: 'Dr. Sarah Khan',
            email: 'demo.doctor@icare.com',
            password: hashedPassword,
            role: 'Doctor',
            phoneNumber: '+92-300-5551234',
            isEmailVerified: true,
            isApproved: true,
        }
    );

    // ── 4. Doctor Profile ────────────────────────────────────────────────────
    console.log('\n[4/9] Doctor profile');
    await findOrCreate(
        Doctor,
        { user: doctorUser._id },
        {
            user: doctorUser._id,
            specialization: 'Internal Medicine',
            degrees: ['MBBS', 'MRCP'],
            experience: '10 years',
            licenseNumber: 'PMC-2015-001234',
            clinicName: 'iCare Medical Centre',
            clinicAddress: 'Model Town, Lahore',
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            availableTime: { start: '09:00', end: '17:00' },
            isApproved: true,
            consultationFee: 1500,
            ratings: [],
            reviews: [],
        }
    );

    // ── 5. Lab User ──────────────────────────────────────────────────────────
    console.log('\n[5/9] Demo laboratory user (demolab@icare.com)');
    const labUser = await findOrCreate(
        User,
        { email: 'demolab@icare.com' },
        {
            name: 'LifeCare Diagnostics',
            email: 'demolab@icare.com',
            password: hashedPassword,
            role: 'Laboratory',
            phoneNumber: '+92-42-35761234',
            isEmailVerified: true,
            isApproved: true,
        }
    );

    // ── 6. Lab Profile ───────────────────────────────────────────────────────
    console.log('\n[6/9] Laboratory profile');
    const labProfile = await findOrCreate(
        Laboratory,
        { user: labUser._id },
        {
            user: labUser._id,
            labName: 'LifeCare Diagnostics',
            ownerName: 'Dr. Imran Butt',
            licenseNumber: 'LAB-PNJ-2020-0099',
            labEmail: 'demolab@icare.com',
            labPhoneNumber: '+92-42-35761234',
            address: 'Plot 25, Gulberg III, Lahore',
            city: 'Lahore',
            workingHours: { start: '07:00', end: '22:00' },
            testsOffered: [
                'Complete Blood Count (CBC)',
                'Lipid Panel',
                'Blood Sugar (Fasting & Random)',
                'Liver Function Tests (LFTs)',
                'Kidney Function Tests (KFTs)',
                'Thyroid Profile (TSH, T3, T4)',
                'HbA1c',
                'Urine Complete Examination',
            ],
            availableTests: [],
            homeSampleAvailable: true,
            isApproved: true,
            ratings: [],
            reviews: [],
        }
    );

    // ── 7. Medical Record ────────────────────────────────────────────────────
    console.log('\n[7/9] Medical record (doctor → anwar, lab: LifeCare Diagnostics)');

    // Remove old demo record so we always get a fresh one
    await MedicalRecord.deleteOne({
        patient: patientUser._id,
        doctor: doctorUser._id,
        'notes': { $regex: 'DEMO SEED' }
    });

    const labTests = [
        'Complete Blood Count (CBC)',
        'Lipid Panel',
        'Blood Sugar (Fasting)',
        'HbA1c',
    ];

    const medRecord = await MedicalRecord.create({
        patient: patientUser._id,
        doctor: doctorUser._id,
        diagnosis: 'Type 2 Diabetes Mellitus with Dyslipidaemia',
        symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision'],
        prescription: {
            medicines: [
                {
                    name: 'Metformin',
                    dosage: '1000mg',
                    frequency: 'Twice daily (with meals)',
                    duration: '30 days',
                    instructions: 'Do not skip meals',
                },
                {
                    name: 'Atorvastatin',
                    dosage: '20mg',
                    frequency: 'Once daily (at bedtime)',
                    duration: '30 days',
                    instructions: 'Avoid grapefruit juice',
                },
                {
                    name: 'Aspirin',
                    dosage: '75mg',
                    frequency: 'Once daily',
                    duration: '30 days',
                    instructions: 'Take after breakfast',
                },
            ],
            notes: 'Maintain low-carb diet. Monitor blood sugar at home daily.',
        },
        labTests,
        vitalSigns: {
            bloodPressure: '138/88 mmHg',
            temperature: '98.6 °F',
            heartRate: '84 bpm',
            weight: '78 kg',
            height: '172 cm',
            oxygenSaturation: '97%',
            respiratoryRate: '18/min',
            bmi: '26.4',
        },
        referredLaboratory: labProfile._id,
        notes: '[DEMO SEED] Patient referred for routine diabetic monitoring panel. Fasting required for 8 hours before CBC and blood sugar tests.',
        followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        isFinalized: true,
        finalizedAt: new Date(),
    });

    console.log('  ✅ MedicalRecord created:', medRecord._id.toString());

    // ── 8. Lab Booking ───────────────────────────────────────────────────────
    console.log('\n[8/9] LabBooking (status: pending, linked to MedicalRecord)');

    await LabBooking.deleteOne({
        medicalRecord: medRecord._id,
    });

    const labBooking = await LabBooking.create({
        laboratory: labProfile._id,
        patient: patientUser._id,
        doctor: doctorUser._id,
        testName: labTests.join(', '),
        medicalRecord: medRecord._id,
        bookingNumber: makeBookingNumber(),
        status: 'pending',
        urgency: 'Normal',
        diagnosisNotes: medRecord.diagnosis,
        specialInstructions: 'Fasting required 8 hours. Please bring this referral slip.',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        price: 3500,
        paymentMethod: 'Cash',
        priority: 'normal',
        verification: {
            status: 'pending',
        },
    });

    console.log('  ✅ LabBooking created:', labBooking._id.toString(), '| Booking#:', labBooking.bookingNumber);

    // ── 9. Notifications ─────────────────────────────────────────────────────
    console.log('\n[9/9] Notifications (lab + patient)');

    // Remove old demo notifications
    await Notification.deleteMany({
        relatedId: labBooking._id,
        relatedModel: 'LabBooking',
    });

    // Notify Laboratory
    const labNotif = await Notification.create({
        user: labUser._id,
        title: '🧪 New Lab Test Order from Doctor',
        message: `Dr. Sarah Khan has referred a patient (Anwar Ahmed) for: ${labTests.join(', ')}. Booking #${labBooking.bookingNumber}. Patient will arrive in 2 days. Fasting sample required.`,
        type: 'lab_order',
        relatedId: labBooking._id,
        relatedModel: 'LabBooking',
        isRead: false,
    });
    console.log('  ✅ Lab notification created:', labNotif._id.toString());

    // Notify Patient
    const patientNotif = await Notification.create({
        user: patientUser._id,
        title: '📋 Lab Tests Ordered by Your Doctor',
        message: `Dr. Sarah Khan has ordered lab tests for you: ${labTests.join(', ')}. Please visit LifeCare Diagnostics (Gulberg III, Lahore) within the next 2 days. Fasting for 8 hours is required. Booking #${labBooking.bookingNumber}.`,
        type: 'lab_order',
        relatedId: labBooking._id,
        relatedModel: 'LabBooking',
        isRead: false,
    });
    console.log('  ✅ Patient notification created:', patientNotif._id.toString());

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log('✅  DEMO DATA SEEDED SUCCESSFULLY');
    console.log('═'.repeat(60));
    console.log('\n  PATIENT');
    console.log('    Email    :', 'anwar@gmail.com');
    console.log('    Password :', 'password123');
    console.log('    User ID  :', patientUser._id.toString());
    console.log('\n  DOCTOR (to test medical record creation)');
    console.log('    Email    :', 'demo.doctor@icare.com');
    console.log('    Password :', 'password123');
    console.log('    User ID  :', doctorUser._id.toString());
    console.log('\n  LABORATORY (receives the order notification)');
    console.log('    Email    :', 'demolab@icare.com');
    console.log('    Password :', 'password123');
    console.log('    Lab ID   :', labProfile._id.toString());
    console.log('\n  MEDICAL RECORD');
    console.log('    ID       :', medRecord._id.toString());
    console.log('    Tests    :', labTests.join(' | '));
    console.log('\n  LAB BOOKING');
    console.log('    ID       :', labBooking._id.toString());
    console.log('    Booking# :', labBooking.bookingNumber);
    console.log('    Status   :', 'pending');
    console.log('\n  NOTIFICATIONS IN DB');
    console.log('    → Lab notified  :', labNotif._id.toString());
    console.log('    → Patient notif :', patientNotif._id.toString());
    console.log('\n' + '═'.repeat(60));
    console.log('Login as anwar@gmail.com to see lab orders + notifications.');
    console.log('Login as demolab@icare.com to see incoming test order.');
    console.log('═'.repeat(60) + '\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error('\n❌ Seed failed:', err);
    process.exit(1);
});
