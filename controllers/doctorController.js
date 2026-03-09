const Doctor = require("../models/doctor");
const bcrypt = require("bcryptjs");

exports.AddDoctorDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("📋 Adding/Updating Doctor Profile for User ID:", userId);
        console.log("📋 Request Body:", JSON.stringify(req.body, null, 2));
        
        const {
            specialization,
            consultationType,
            languages,
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
            existingProfile.consultationType = consultationType;
            existingProfile.languages = languages;
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
            consultationType,
            languages,
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

exports.GetDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findById(id).populate('user', 'name email role phoneNumber createdAt');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json({ success: true, doctor });
    } catch (error) {
        console.error('GetDoctorById Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.AddDoctorReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;
        const role = req.user.role;
        if (role !== 'Patient') {
            return res.status(403).json({ message: 'Only patients can add reviews' });
        }
        const doc = await Doctor.findById(id);
        if (!doc) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        if (rating !== undefined) {
            const r = Number(rating);
            if (Number.isNaN(r) || r < 1 || r > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }
            doc.ratings = Array.isArray(doc.ratings) ? [...doc.ratings, r] : [r];
        }
        if (review) {
            doc.reviews = Array.isArray(doc.reviews) ? [...doc.reviews, String(review)] : [String(review)];
        }
        await doc.save();
        res.status(200).json({ success: true, doctor: doc });
    } catch (error) {
        console.error('AddDoctorReview Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.FilterDoctors = async (req, res) => {
    try {
        const {
            specialization,
            consultationType,
            location,
            language,
            languages,
            day,
            time,
            minRating
        } = req.query;
        const query = {};
        if (specialization) {
            query.specialization = { $regex: specialization, $options: "i" };
        }
        if (consultationType) {
            query.consultationType = consultationType;
        }
        if (location) {
            query.clinicAddress = { $regex: location, $options: "i" };
        }
        let langs = [];
        if (languages) {
            langs = String(languages).split(",").map((s) => s.trim()).filter(Boolean);
        } else if (language) {
            langs = [String(language).trim()];
        }
        if (langs.length > 0) {
            query.languages = { $in: langs };
        }
        if (day) {
            query.availableDays = { $in: [day] };
        }
        const docs = await Doctor.find(query).populate("user", "name email role");
        const parseTime = (t) => {
            if (!t) return null;
            const parts = String(t).split(":");
            if (parts.length < 2) return null;
            const h = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            if (Number.isNaN(h) || Number.isNaN(m)) return null;
            return h * 60 + m;
        };
        const targetMinutes = time ? parseTime(time) : null;
        const minR = minRating ? Number(minRating) : null;
        const filtered = docs.filter((d) => {
            let ok = true;
            if (targetMinutes !== null) {
                const start = d.availableTime && d.availableTime.start ? parseTime(d.availableTime.start) : null;
                const end = d.availableTime && d.availableTime.end ? parseTime(d.availableTime.end) : null;
                if (start === null || end === null) ok = false;
                else ok = ok && targetMinutes >= start && targetMinutes <= end;
            }
            if (minR !== null && Array.isArray(d.ratings)) {
                const arr = d.ratings;
                const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
                ok = ok && avg >= minR;
            }
            return ok;
        });
        res.status(200).json({ success: true, count: filtered.length, doctors: filtered });
    } catch (error) {
        console.error("FilterDoctors Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
