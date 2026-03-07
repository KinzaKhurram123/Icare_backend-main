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
            filter.doctor = userId
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

exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, timeSlot, reason, status } = req.body;
        const userId = req.user._id;
        const role = req.user.role;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const isParticipant = appointment.patient.toString() === userId.toString() || appointment.doctor.toString() === userId.toString();
        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }

        const update = {};
        if (date !== undefined) update.date = date;
        if (timeSlot !== undefined) update.timeSlot = timeSlot;
        if (reason !== undefined) update.reason = reason;
        if (status !== undefined) {
            if (role === 'Doctor') {
                update.status = status;
            } else if (role === 'Patient' && status === 'cancelled') {
                update.status = status;
            } else {
                return res.status(403).json({ message: 'Not allowed to set this status' });
            }
        }

        const updated = await Appointment.findByIdAndUpdate(id, { $set: update }, { new: true });
        res.status(200).json({ success: true, appointment: updated });
    } catch (error) {
        console.error('Update Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const isParticipant = appointment.patient.toString() === userId.toString() || appointment.doctor.toString() === userId.toString();
        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to delete this appointment' });
        }

        await Appointment.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Appointment deleted' });
    } catch (error) {
        console.error('Delete Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;
        const role = req.user.role;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const isParticipant = appointment.patient.toString() === userId.toString() || appointment.doctor.toString() === userId.toString();
        if (!isParticipant) {
            return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
        }
        const cancelledBy = appointment.doctor.toString() === userId.toString() ? 'Doctor' : 'Patient';
        const update = {
            status: 'cancelled',
            cancellationReason: reason || null,
            cancelledBy,
            cancelledAt: new Date()
        };
        const updated = await Appointment.findByIdAndUpdate(id, { $set: update }, { new: true });
        res.status(200).json({ success: true, appointment: updated });
    } catch (error) {
        console.error('Cancel Appointment Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getUpcomingAppointments = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;
        const windowHours = parseInt(req.query.windowHours || '24', 10);
        const now = new Date();
        const until = new Date(now.getTime() + windowHours * 60 * 60 * 1000);

        const filter = {
            date: { $gte: now, $lte: until },
            status: { $in: ['pending', 'confirmed'] }
        };
        if (role === 'Patient') {
            filter.patient = userId;
        } else if (role === 'Doctor') {
            filter.doctor = userId;
        } else {
            return res.status(403).json({ message: 'Only doctors or patients can view upcoming appointments' });
        }
        const appointments = await Appointment.find(filter)
            .populate('doctor', 'name email')
            .populate('patient', 'name email')
            .sort({ date: 1 });
        res.status(200).json({ success: true, count: appointments.length, appointments });
    } catch (error) {
        console.error('Get Upcoming Appointments Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
