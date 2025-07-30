const express = require('express');
const { AddDoctorDetails, GetAllDoctors } = require('../controllers/doctorController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add_doctor_details', protect, AddDoctorDetails)
router.get('/get_all_doctors', GetAllDoctors)
module.exports = router;
