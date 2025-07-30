const express = require('express');
const protect = require('../middleware/authMiddleware');
const { AddPaitentsDetails } = require('../controllers/patientController');

const router = express.Router();

router.post('/add_paitent_details', protect, AddPaitentsDetails)
// router.get('/get_all_doctors', GetAllDoctors)
module.exports = router;
