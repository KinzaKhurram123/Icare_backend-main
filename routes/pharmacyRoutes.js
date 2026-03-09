const express = require('express');
const protect = require('../middleware/authMiddleware');
const { AddPharmacyDetails, getAllPharmacy, getPharmacyById, getPharmacyProfile } = require('../controllers/pharmacyController');

const router = express.Router();

router.get('/profile', protect, getPharmacyProfile);
router.post('/add_pharmacy_details', protect, AddPharmacyDetails);
router.get('/get_all_pharmacy', getAllPharmacy);
router.get('/:id', getPharmacyById);

module.exports = router;
