const express = require('express');
const protect = require('../middleware/authMiddleware');
const { AddLaboratoryDetails, getAllLaboratories, getLaboratoryById, FilterLaboratories, AddLaboratoryReview } = require('../controllers/laboratoryController');
const { createBooking, getMyBookings, getLabBookings, getBookingById, updateBooking, cancelBooking, deleteBooking } = require('../controllers/labBookingController');

const router = express.Router();

router.post('/add_laboratory_details', protect, AddLaboratoryDetails);
router.get('/get_all_laboratories', getAllLaboratories);
router.get('/filter', FilterLaboratories);
router.post('/:id/reviews', protect, AddLaboratoryReview);
// bookings
router.post('/:labId/bookings', protect, createBooking);
router.get('/:labId/bookings', protect, getLabBookings);
router.get('/bookings/my', protect, getMyBookings);
router.get('/bookings/:id', protect, getBookingById);
router.put('/bookings/:id', protect, updateBooking);
router.put('/bookings/:id/cancel', protect, cancelBooking);
router.delete('/bookings/:id', protect, deleteBooking);
router.get('/:id', getLaboratoryById);

module.exports = router;
