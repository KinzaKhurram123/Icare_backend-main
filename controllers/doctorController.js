const Doctor = require("../models/doctor");
const bcrypt = require("bcryptjs");

exports.AddDoctorDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("📋 Adding/Updating Doctor Profile for User ID:", userId);
        console.log("📋 Request Body:", JSON.stringify(req.body, null, 2));
        
        const {
            specialization,
            degrees,
            experience,
            licenseNumber,
            clinicName,
            clinicAddress,
            availableDays,
            availableTime,
            isApproved,
            ratings,
            reviews
        } = req.body;

        const existingProfile = await Doctor.findOne({ user: userId });
        if (existingProfile) {
            console.log("✅ Found existing doctor profile, updating...");
            existingProfile.specialization = specialization;
            existingProfile.degrees = degrees;
            existingProfile.experience = experience;
            existingProfile.licenseNumber = licenseNumber;
            existingProfile.clinicName = clinicName;
            existingProfile.clinicAddress = clinicAddress;
            existingProfile.availableDays = availableDays;
            existingProfile.availableTime = availableTime;
            await existingProfile.save();
            console.log("✅ Doctor profile updated successfully");
            console.log("Updated Profile:", JSON.stringify(existingProfile, null, 2));
            return res.status(200).json({
                message: "Doctor profile updated successfully",
                doctor: existingProfile,
            });

        }

        console.log("✅ Creating new doctor profile...");
        const doctor = await Doctor.create({
            user: userId,
            specialization,
            degrees,
            experience,
            licenseNumber,
            clinicName,
            clinicAddress,
            availableDays,
            availableTime,
            isApproved: isApproved ?? false,
            ratings: ratings ?? [],
            reviews: reviews ?? []
        });
        console.log("✅ Doctor profile created successfully");
        console.log("New Profile:", JSON.stringify(doctor, null, 2));

        return res.status(201).json({ message: "Doctor profile created successfully", doctor, success: true });
    } catch (error) {
        console.error("❌ AddDoctorDetails Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.GetAllDoctors = async (req, res) => {
    try {
        console.log("📋 Fetching all doctors...");
        const doctors = await Doctor.find().populate('user', 'name email role');
        console.log(`✅ Found ${doctors.length} doctors in database`);
        doctors.forEach((doc, index) => {
            console.log(`Doctor ${index + 1}:`, {
                id: doc._id,
                userName: doc.user?.name,
                specialization: doc.specialization,
                degrees: doc.degrees,
                availableDays: doc.availableDays
            });
        });
        res.status(200).json({ doctors });
    } catch (error) {
        console.error('❌ Get All Doctors Error:', error);
        res.status(500).json({ message: 'Server error while fetching doctors' });
    }
};
