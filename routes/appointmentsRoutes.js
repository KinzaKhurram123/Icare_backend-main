const express = require('express');
const { bookAppointment, getMyAppointments } = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/book_appointment', protect, bookAppointment);
router.get('/getAppointments', getMyAppointments)

module.exports = router;
