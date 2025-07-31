const Appointment = require('../models/appointment')
const User = require('../models/user');


exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason } = req.body;
        const patientId = req.user._id;

        const doctor = await User.findOne({ _id: doctorId, role: 'Doctor' });
        console.log("🚀 ~ doctor:", doctor)
        if (!doctor) {
            return res.status(400).json({ message: 'Invalid doctor ID' });
        }

        const appointment = await Appointment.create({
            doctor: doctorId,
            patient: patientId,
            date,
            timeSlot,
            reason
        });

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment,
            success: true
        });

    } catch (error) {
        console.error('Book Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.getMyAppointments = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        let filter = {}

        if (role === 'Patient') {
            filter.patient = userId
        } else if (role === 'Doctor') {
            filter.doctor === userId
        } else {
            return res.status(403).json({ message: "Only doctors or patients can view appointments" });
        }
        const appointments = await Appointment.find(filter)
            .populate('doctor', 'name email availableTime isApproved isApproved  ratings reviews availableDays clinicAddress clinicAddress degrees experience licenseNumber specialization')
            .populate('patient', 'name email')
            .sort({ date: -1 });
        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.log('Get Appointment Error', error)
        res.status(500).json({ message: "Internal server error" });

    }
}