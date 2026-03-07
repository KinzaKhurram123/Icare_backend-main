const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema({
  laboratory: { type: mongoose.Schema.Types.ObjectId, ref: 'Laboratory', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testName: { type: String, required: true },
  contactName: String,
  contactPhone: String,
  contactLocation: String,
  age: Number,
  date: { type: Date, required: true },
  time: { type: String, required: true },
  homeSample: { type: Boolean, default: false },
  prescription: Object,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  cancellationReason: String,
  cancelledBy: { type: String, enum: ['Laboratory', 'Patient'] },
  cancelledAt: Date,
  bookingNumber: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('LabBooking', labBookingSchema);
