const bcrypt = require("bcryptjs");
const Pharmacy = require("../models/pharmacy");


exports.AddPharmacyDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            cnic,
            ownerName,
            licenseNumber,
            licenseDocument,
            isAprroved,
            address,
            city,
            location,
            deliveryAvailable,
            openHours,
            availableMedicines
        } = req.body;

        const existingProfile = await Pharmacy.findOne({ user: userId }).populate('user', 'name email phoneNumber role createdAt')
        if (existingProfile) {
            existingProfile.cnic = cnic;
            existingProfile.ownerName = ownerName;
            existingProfile.licenseNumber = licenseNumber;
            existingProfile.licenseDocument = licenseDocument;
            existingProfile.isApproved = isAprroved;
            existingProfile.address = address;
            existingProfile.city = city;
            existingProfile.location = location;
            existingProfile.deliveryAvailable = deliveryAvailable;
            existingProfile.ownerName = ownerName;
            existingProfile.openHours = openHours;
            existingProfile.availableMedicines = availableMedicines
            await existingProfile.save()
            return res.status(200).json({
                message: 'Pharmacy Updated Successfully',
                existingProfile,
                success: true
            })
        }
        const pharmacy = await Pharmacy.create({
            user: userId,
            cnic,
            ownerName,
            licenseNumber,
            licenseDocument,
            address,
            city,
            location,
            deliveryAvailable,
            openHours,
            availableMedicines: availableMedicines ?? []
        })
        const fullpharmacy = await Pharmacy.findById(pharmacy._id).populate('user', 'name  email role phoneNunber createdAt')
        return res.status(201).json({
            message: "Pharmacy created successfully",
            paitent: fullpharmacy,
            success: true
        })
    } catch (error) {
        console.error("AddPharmacyDetails Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


exports.getAllPharmacy = async (req, res) => {
    try {
        const pharmacies = await Pharmacy.find().populate("user", "name email role phoneNumber");
        res.status(200).json({ success: true, pharmacies });
    } catch (error) {
        console.error("Get All Pharmacies Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
