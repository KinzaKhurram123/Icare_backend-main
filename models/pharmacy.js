const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const pharmacySchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNumber: String,
    cnic: String,
    ownerName: String,

    licenseNumber: String,
    licenseDocument: String,
    isApproved: { type: Boolean, default: false },

    address: String,
    city: String,
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    deliveryAvailable: Boolean,
    openHours: {
        from: String,
        to: String
    },

    availableMedicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }]
}, { timestamps: true });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
module.exports = Pharmacy;