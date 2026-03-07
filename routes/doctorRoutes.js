const express = require('express');
const { AddDoctorDetails, GetAllDoctors, FilterDoctors, GetDoctorById, AddDoctorReview } = require('../controllers/doctorController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add_doctor_details', protect, AddDoctorDetails)
router.get('/get_all_doctors', GetAllDoctors)
router.get('/filter', FilterDoctors)
router.get('/:id', GetDoctorById)
router.post('/:id/reviews', protect, AddDoctorReview)
module.exports = router;
