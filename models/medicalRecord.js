const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    diagnosis: String,
    symptoms: [String],
    prescription: {
        medicines: [{
            name: String,
            dosage: String,
            frequency: String,
            duration: String,
            instructions: String
        }],
        notes: String
    },
    labTests: [String],
    vitalSigns: {
        bloodPressure: String,
        temperature: String,
        heartRate: String,
        weight: String,
        height: String
    },
    notes: String,
    followUpDate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
