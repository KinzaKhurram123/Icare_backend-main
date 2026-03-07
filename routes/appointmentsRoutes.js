const express = require('express');
const { bookAppointment, getMyAppointments, updateAppointment, deleteAppointment, cancelAppointment, getUpcomingAppointments } = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/book_appointment', protect, bookAppointment);
router.get('/getAppointments', protect, getMyAppointments);
router.get('/upcoming', protect, getUpcomingAppointments);
router.put('/:id', protect, updateAppointment);
router.put('/:id/cancel', protect, cancelAppointment);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;
