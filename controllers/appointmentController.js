const Appointment = require('../models/appointment')
const User = require('../models/user');
const Doctor = require('../models/doctor');


exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, timeSlot, reason } = req.body;
        const patientId = req.user._id;

        console.log('📅 Booking appointment request:');
        console.log('Doctor ID:', doctorId);
        console.log('Patient ID:', patientId);
        console.log('Date:', date);
        console.log('Time Slot:', timeSlot);

        // Find the doctor document to get the user ID
        const doctorDoc = await Doctor.findById(doctorId).populate('user');
        console.log("🚀 ~ doctorDoc:", doctorDoc);
        
        if (!doctorDoc || !doctorDoc.user) {
            return res.status(400).json({ message: 'Invalid doctor ID' });
        }

        const doctorUserId = doctorDoc.user._id;
        console.log("✅ Doctor User ID:", doctorUserId);

        const appointment = await Appointment.create({
            doctor: doctorUserId,
            patient: patientId,
            date,
            timeSlot,
            reason
        });

        console.log('✅ Appointment created successfully:', appointment._id);

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment,
            success: true
        });

    } catch (error) {
        console.error('❌ Book Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.getMyAppointments = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        console.log('📋 Fetching appointments for:', role, userId);

        let filter = {}

        if (role === 'Patient') {
            filter.patient = userId
        } else if (role === 'Doctor') {
            filter.doctor = userId  // Fixed: was === instead of =
        } else {
            return res.status(403).json({ message: "Only doctors or patients can view appointments" });
        }

        console.log('🔍 Filter:', filter);

        const appointments = await Appointment.find(filter)
            .populate('doctor', 'name email phoneNumber')
            .populate('patient', 'name email phoneNumber')
            .sort({ date: -1 });

        console.log(`✅ Found ${appointments.length} appointments`);

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });

    } catch (error) {
        console.log('❌ Get Appointment Error', error)
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        const userId = req.user._id;

        console.log('📝 Updating appointment:', appointmentId, 'to status:', status);

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user is the doctor for this appointment
        if (appointment.doctor.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }

        appointment.status = status;
        await appointment.save();

        console.log('✅ Appointment status updated');

        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully',
            appointment
        });

    } catch (error) {
        console.error('❌ Update Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}