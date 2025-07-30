const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const patientSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNumber: String,
    gender: String,
    dateOfBirth: Date,
    profileImage: String,
    bloodGroup: String,
    cnic: String,
    address: String,
    allergies: [String],
    medicalConditions: [String],
    currentMedications: [String],
    emergencyContact: {
        name: String,
        phone: String,
    },

    height: Number,
    weight: Number,
    isVerified: { type: Boolean, default: false },
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
}, { timestamps: true });


const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;