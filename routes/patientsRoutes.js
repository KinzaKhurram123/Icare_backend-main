const express = require('express');
const protect = require('../middleware/authMiddleware');
const { AddPaitentsDetails, getAllPaitent } = require('../controllers/patientController');

const router = express.Router();

router.post('/add_patient_details', protect, AddPaitentsDetails)
router.get('/get_all_patients', getAllPaitent)
module.exports = router;
