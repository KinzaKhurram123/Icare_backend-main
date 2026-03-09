const express = require('express');
const { AddDoctorDetails, GetAllDoctors, FilterDoctors, GetDoctorById, AddDoctorReview, UpdateAvailability, GetAvailability } = require('../controllers/doctorController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add_doctor_details', protect, AddDoctorDetails)
router.get('/get_all_doctors', GetAllDoctors)
router.get('/filter', FilterDoctors)
// Availability routes must come before /:id route
router.get('/availability/me', protect, GetAvailability)
router.put('/availability', protect, UpdateAvailability)
// Dynamic routes should come last
router.get('/:id', GetDoctorById)
router.post('/:id/reviews', protect, AddDoctorReview)

module.exports = router;
