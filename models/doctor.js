const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    specialization: String,
    degrees: [String],
    experience: String,
    licenseNumber: String,
    clinicName: String,
    clinicAddress: String,
    availableDays: [String],
    availableTime: {
        start: String,
        end: String
    },
    isApproved: { type: Boolean, default: false },
    ratings: [Number],
    reviews: [String]
});

module.exports = mongoose.model("Doctor", doctorSchema);
