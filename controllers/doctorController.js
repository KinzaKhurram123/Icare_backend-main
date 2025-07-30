const Doctor = require("../models/doctor");
const bcrypt = require("bcryptjs");

exports.AddDoctorDetails = async (req, res) => {
    try {
        const userId = req.user.id;
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
            existingProfile.specialization = specialization;
            existingProfile.degrees = degrees;
            existingProfile.experience = experience;
            existingProfile.licenseNumber = licenseNumber;
            existingProfile.clinicName = clinicName;
            existingProfile.clinicAddress = clinicAddress;
            existingProfile.availableDays = availableDays;
            existingProfile.availableTime = availableTime;
            await existingProfile.save();
            return res.status(200).json({
                message: "Doctor profile updated successfully",
                doctor: existingProfile,
            });

        }

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

        return res.status(201).json({ message: "Doctor profile created successfully", doctor, success: true });
    } catch (error) {
        console.error("AddDoctorDetails Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.GetAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('user', 'name email role');
        res.status(200).json({ doctors });
    } catch (error) {
        console.error('Get All Doctors Error:', error);
        res.status(500).json({ message: 'Server error while fetching doctors' });
    }
};
