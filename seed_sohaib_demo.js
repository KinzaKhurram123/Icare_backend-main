/**
 * seed_sohaib_demo.js
 *
 * Seeds a medical record flow for sohaib@gmail.com by Dr. Farhan (farhan@gmail.com)
 * Includes Lab Referrals and LMS Health Programs.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// Models
const User = require('./models/user');
const Patient = require('./models/patient');
const Doctor = require('./models/doctor');
const Laboratory = require('./models/laboratory');
const MedicalRecord = require('./models/medicalRecord');
const LabBooking = require('./models/labBooking');
const Notification = require('./models/notification');
const Course = require('./models/course');

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

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('\n🌱 Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Patient User: sohaib@gmail.com
        console.log('\n[1/10] Patient user (sohaib@gmail.com)');
        const patientUser = await findOrCreate(
            User,
            { email: 'sohaib@gmail.com' },
            {
                name: 'Sohaib Khan',
                email: 'sohaib@gmail.com',
                password: hashedPassword,
                role: 'Patient',
                phoneNumber: '+92-311-5556677',
                isEmailVerified: true,
                isApproved: true,
            }
        );

        // 2. Patient Profile
        console.log('\n[2/10] Patient profile');
        await findOrCreate(
            Patient,
            { user: patientUser._id },
            {
                user: patientUser._id,
                gender: 'Male',
                dateOfBirth: new Date('1992-08-15'),
                bloodGroup: 'A+',
                cnic: '35202-9988776-5',
                address: 'DHA Phase 6, Lahore',
                allergies: ['Dust', 'Pollen'],
                medicalConditions: ['Hypertension', 'High Cholesterol'],
                height: 180,
                weight: 85,
            }
        );

        // 3. Doctor User: farhan@gmail.com
        console.log('\n[3/10] Doctor user (farhan@gmail.com)');
        const doctorUser = await findOrCreate(
            User,
            { email: 'farhan@gmail.com' },
            {
                name: 'Dr. Farhan Ahmed',
                email: 'farhan@gmail.com',
                password: hashedPassword,
                role: 'Doctor',
                phoneNumber: '+92-321-4443322',
                isEmailVerified: true,
                isApproved: true,
            }
        );

        // 4. Doctor Profile
        console.log('\n[4/10] Doctor profile');
        await findOrCreate(
            Doctor,
            { user: doctorUser._id },
            {
                user: doctorUser._id,
                specialization: 'Cardiology',
                degrees: ['MBBS', 'FCPS (Cardiology)'],
                experience: '12 years',
                licenseNumber: 'PMC-2012-09876',
                clinicName: 'Lahore Cardiac Center',
                isApproved: true,
                consultationFee: 2000,
            }
        );

        // 5. Lab User
        const labEmail = 'citylab@icare.com';
        console.log(`\n[5/10] Lab user (${labEmail})`);
        const labUser = await findOrCreate(
            User,
            { email: labEmail },
            {
                name: 'City Lab & Diagnostics',
                email: labEmail,
                password: hashedPassword,
                role: 'Laboratory',
                phoneNumber: '+92-42-3665544',
                isEmailVerified: true,
                isApproved: true,
            }
        );

        // 6. Lab Profile
        console.log('\n[6/10] Laboratory profile');
        const labProfile = await findOrCreate(
            Laboratory,
            { user: labUser._id },
            {
                user: labUser._id,
                labName: 'City Lab & Diagnostics',
                ownerName: 'Dr. Zafar Iqbal',
                licenseNumber: 'LAB-LHR-5566',
                labEmail: labEmail,
                address: 'Gulberg Main Blvd, Lahore',
                city: 'Lahore',
                testsOffered: ['Lipid Profile', 'ECG', 'Treadmill Test', 'Echocardiogram', 'CBC'],
                isApproved: true,
            }
        );

        // 7. LMS Health Programs (Courses)
        console.log('\n[7/10] Seeding LMS Health Programs');

        // Cleanup old demo courses to ensure fresh modules are loaded
        await Course.deleteMany({ title: { $in: ['Heart-Healthy Living 101', 'Managing Hypertension Naturally', 'Exercise for Cardiac Health'] } });

        const courses = [
            {
                title: 'Heart-Healthy Living 101',
                description: 'A comprehensive guide to maintaining a healthy heart through diet, exercise, and lifestyle changes.',
                instructor: doctorUser._id,
                category: 'HealthProgram',
                targetAudience: 'Patient',
                healthConditions: ['hypertension', 'heart-health'],
                difficulty: 'Beginner',
                duration: 5,
                isPublished: true,
                publishedAt: new Date(),
                rating: { average: 4.9, count: 128 },
                modules: [
                    {
                        title: 'Understanding Your Heart',
                        description: 'Basics of cardiovascular health and how hypertension affects your body.',
                        order: 1,
                        lessons: [
                            {
                                title: 'How Blood Pressure Works',
                                content: 'Blood pressure is the force of your blood pushing against the walls of your arteries...',
                                duration: 15,
                                order: 1
                            },
                            {
                                title: 'The Impact of High Cholesterol',
                                content: "Cholesterol is a waxy, fat-like substance that's found in all the cells in your body...",
                                duration: 20,
                                order: 2
                            }
                        ]
                    },
                    {
                        title: 'Dietary Changes for a Strong Heart',
                        description: 'Practical steps to reduce sodium and saturated fats.',
                        order: 2,
                        lessons: [
                            {
                                title: 'The DASH Diet Explained',
                                content: 'The DASH diet (Dietary Approaches to Stop Hypertension) is a flexible and balanced eating plan...',
                                duration: 30,
                                order: 1
                            }
                        ]
                    }
                ]
            },
            {
                title: 'Managing Hypertension Naturally',
                description: 'Learn how to control your blood pressure through sodium reduction, the DASH diet, and stress management.',
                instructor: doctorUser._id,
                category: 'HealthProgram',
                targetAudience: 'Patient',
                healthConditions: ['hypertension'],
                difficulty: 'Intermediate',
                duration: 8,
                isPublished: true,
                publishedAt: new Date(),
                rating: { average: 4.7, count: 85 }
            },
            {
                title: 'Exercise for Cardiac Health',
                description: 'Safe and effective exercise routines specifically designed for individuals with cardiovascular concerns.',
                instructor: doctorUser._id,
                category: 'HealthProgram',
                targetAudience: 'Patient',
                healthConditions: ['heart-health', 'fitness'],
                difficulty: 'Beginner',
                duration: 4,
                isPublished: true,
                publishedAt: new Date(),
                rating: { average: 4.8, count: 210 }
            }
        ];

        for (const courseData of courses) {
            await findOrCreate(Course, { title: courseData.title }, courseData);
        }

        // 8. Create Medical Record
        console.log('\n[8/10] Creating Medical Record for Sohaib');

        // Cleanup old demo records for this patient/doctor pair to avoid duplicates
        await MedicalRecord.deleteMany({ patient: patientUser._id, doctor: doctorUser._id });
        await LabBooking.deleteMany({ patient: patientUser._id, doctor: doctorUser._id });

        const labTests = ['Lipid Profile', 'CBC'];
        const medRecord = await MedicalRecord.create({
            patient: patientUser._id,
            doctor: doctorUser._id,
            diagnosis: 'Grade 1 Hypertension & Hyperlipidemia',
            symptoms: ['Occasional morning headaches', 'Mild dizziness'],
            prescription: {
                medicines: [
                    {
                        name: 'Amlodipine',
                        dosage: '5mg',
                        frequency: 'Once daily',
                        duration: '60 days',
                        instructions: 'In the morning'
                    },
                    {
                        name: 'Rosuvastatin',
                        dosage: '10mg',
                        frequency: 'Once daily',
                        duration: '60 days',
                        instructions: 'At night'
                    }
                ],
                notes: 'Reduce salt intake. Low fat diet recommended.'
            },
            labTests,
            referredLaboratory: labProfile._id,
            notes: '[AUTO-SEED] Patient needs baseline lipid profile and CBC for hypertension assessment.',
            followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            isFinalized: true,
            finalizedAt: new Date()
        });
        console.log('  ✅ MedicalRecord created:', medRecord._id);

        // 9. Create Lab Booking
        console.log('\n[9/10] Creating Lab Booking');
        const labBooking = await LabBooking.create({
            laboratory: labProfile._id,
            patient: patientUser._id,
            doctor: doctorUser._id,
            testName: labTests.join(', '),
            medicalRecord: medRecord._id,
            bookingNumber: makeBookingNumber(),
            status: 'pending',
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            price: 2800,
            paymentMethod: 'Cash'
        });
        console.log('  ✅ LabBooking created:', labBooking._id);

        // 10. Notifications
        console.log('\n[10/10] Sending Notifications');

        // Lab Notification
        await Notification.create({
            user: labUser._id,
            title: '🧪 New Lab Referral',
            message: `Dr. Farhan Ahmed has referred Sohaib Khan for: ${labTests.join(', ')}. Booking ID: ${labBooking.bookingNumber}.`,
            type: 'lab_order',
            relatedId: labBooking._id,
            relatedModel: 'LabBooking'
        });

        // Patient Notification
        await Notification.create({
            user: patientUser._id,
            title: '📋 Your Medical Report & Referrals',
            message: `Dr. Farhan Ahmed has finalized your checkup. He has referred you to City Lab & Diagnostics for ${labTests.join(', ')}.`,
            type: 'lab_order',
            relatedId: labBooking._id,
            relatedModel: 'LabBooking'
        });

        console.log('\n🚀 SEEDING COMPLETED FOR sohaib@gmail.com');
        console.log(`Doctor: farhan@gmail.com`);
        console.log(`Patient: sohaib@gmail.com`);
        console.log(`Check "Heart-Healthy" courses in LMS!`);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
