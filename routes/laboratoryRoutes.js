const express = require('express');
const protect = require('../middleware/authMiddleware');
const { AddLaboratoryDetails, getAllLaboratories, getLaboratoryById, FilterLaboratories, AddLaboratoryReview, getLaboratoryProfile } = require('../controllers/laboratoryController');
const { createBooking, getMyBookings, getLabBookings, getBookingById, updateBooking, cancelBooking, deleteBooking } = require('../controllers/labBookingController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/reports');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post('/add_laboratory_details', protect, AddLaboratoryDetails);
router.get('/get_all_laboratories', getAllLaboratories);
router.get('/filter', FilterLaboratories);
router.get('/profile', protect, getLaboratoryProfile);
router.get('/bookings/my', protect, getMyBookings);
router.post('/:id/reviews', protect, AddLaboratoryReview);
// bookings
router.post('/:labId/bookings', protect, createBooking);
router.get('/:labId/bookings', protect, getLabBookings);
router.get('/bookings/:id', protect, getBookingById);
router.put('/bookings/:id', protect, updateBooking);
router.put('/bookings/:id/cancel', protect, cancelBooking);
router.delete('/bookings/:id', protect, deleteBooking);
router.post('/bookings/:id/upload-report', protect, upload.single('report'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const reportUrl = `${req.protocol}://${req.get('host')}/uploads/reports/${req.file.filename}`;
    res.status(200).json({ success: true, reportUrl });
});
router.get('/:id', getLaboratoryById);

module.exports = router;
