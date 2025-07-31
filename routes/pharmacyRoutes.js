const express = require('express');
const protect = require('../middleware/authMiddleware');
const { AddPharmacyDetails, getAllPharmacy } = require('../controllers/pharmacyController');

const router = express.Router();

router.post('/add_pharmacy_details', protect, AddPharmacyDetails)
router.get('/get_all_pharmacy', getAllPharmacy)

module.exports = router;
