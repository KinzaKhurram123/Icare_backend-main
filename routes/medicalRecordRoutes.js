const express = require('express');
const {
    createMedicalRecord,
    getPatientRecords,
    getDoctorRecords,
    updateMedicalRecord,
    getRecordById
} = require('../controllers/medicalRecordController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', protect, createMedicalRecord);
router.get('/patient/:patientId', protect, getPatientRecords);
router.get('/doctor', protect, getDoctorRecords);
router.get('/:recordId', protect, getRecordById);
router.put('/:recordId', protect, updateMedicalRecord);

module.exports = router;
