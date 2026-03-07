const MedicalRecord = require("../models/medicalRecord");
const User = require("../models/user");

// Create medical record
exports.createMedicalRecord = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const {
            patientId,
            appointmentId,
            diagnosis,
            symptoms,
            prescription,
            labTests,
            vitalSigns,
            notes,
            followUpDate
        } = req.body;

        console.log("📋 Creating medical record for patient:", patientId);

        const record = await MedicalRecord.create({
            patient: patientId,
            doctor: doctorId,
            appointment: appointmentId,
            diagnosis,
            symptoms,
            prescription,
            labTests,
            vitalSigns,
            notes,
            followUpDate
        });

        const populatedRecord = await MedicalRecord.findById(record._id)
            .populate('patient', 'name email phoneNumber')
            .populate('doctor', 'name email');

        console.log("✅ Medical record created successfully");

        res.status(201).json({
            success: true,
            message: "Medical record created successfully",
            record: populatedRecord
        });
    } catch (error) {
        console.error("❌ Create Medical Record Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get patient's medical history
exports.getPatientRecords = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        console.log("📋 Fetching medical records for patient:", patientId);

        const records = await MedicalRecord.find({ patient: patientId })
            .populate('doctor', 'name email')
            .populate('appointment', 'date timeSlot')
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${records.length} medical records`);

        res.status(200).json({
            success: true,
            records
        });
    } catch (error) {
        console.error("❌ Get Patient Records Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get doctor's all records
exports.getDoctorRecords = async (req, res) => {
    try {
        const doctorId = req.user.id;
        
        console.log("📋 Fetching medical records for doctor:", doctorId);

        const records = await MedicalRecord.find({ doctor: doctorId })
            .populate('patient', 'name email phoneNumber')
            .populate('doctor', 'name email')
            .populate('appointment', 'date timeSlot')
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${records.length} medical records`);

        res.status(200).json({
            success: true,
            records
        });
    } catch (error) {
        console.error("❌ Get Doctor Records Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update medical record
exports.updateMedicalRecord = async (req, res) => {
    try {
        const { recordId } = req.params;
        const doctorId = req.user.id;

        console.log("📋 Updating medical record:", recordId);

        const record = await MedicalRecord.findOne({ _id: recordId, doctor: doctorId });

        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        Object.assign(record, req.body);
        record.updatedAt = Date.now();
        await record.save();

        const populatedRecord = await MedicalRecord.findById(record._id)
            .populate('patient', 'name email phoneNumber')
            .populate('doctor', 'name email');

        console.log("✅ Medical record updated successfully");

        res.status(200).json({
            success: true,
            message: "Medical record updated successfully",
            record: populatedRecord
        });
    } catch (error) {
        console.error("❌ Update Medical Record Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get single record
exports.getRecordById = async (req, res) => {
    try {
        const { recordId } = req.params;

        const record = await MedicalRecord.findById(recordId)
            .populate('patient', 'name email phoneNumber')
            .populate('doctor', 'name email')
            .populate('appointment', 'date timeSlot status');

        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        res.status(200).json({
            success: true,
            record
        });
    } catch (error) {
        console.error("❌ Get Record Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
