const Doctor = require("../models/doctor")
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
            return res.status(400).json({ message: "Doctor profile already exists." });
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

        return res.status(201).json({ message: "Doctor profile created successfully", doctor });
    } catch (error) {
        console.error("AddDoctorDetails Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
