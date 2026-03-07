const express = require('express');
const { bookAppointment, getMyAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/book_appointment', protect, bookAppointment);
router.get('/getAppointments', protect, getMyAppointments);
router.put('/update_status', protect, updateAppointmentStatus);

module.exports = router;
