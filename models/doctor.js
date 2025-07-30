const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const doctorSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNumber: String,
    gender: String,
    dateOfBirth: Date,
    profileImage: String,
    specialization: String,
    degrees: [String],
    experience: Number,
    licenseNumber: String,
    clinicName: String,
    clinicAddress: String,
    availableDays: [String],
    availableTime: {
        from: String,
        to: String
    },
    isApproved: { type: Boolean, default: false },
    ratings: { type: Number, default: 0 },
    reviews: [
        {
            patientName: String,
            comment: String,
            rating: Number,
            date: Date
        }
    ]
}, { timestamps: true });


const Doctor = mongoose.model('Doctor', doctorSchema);
