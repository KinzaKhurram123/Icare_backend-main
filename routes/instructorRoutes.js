const express = require('express');
const protect = require('../middleware/authMiddleware');
const { AddInstructorDetails, getAllInstructors, getInstructorById, getMyInstructorProfile } = require('../controllers/instructorController');

const router = express.Router();

router.post('/add_instructor_details', protect, AddInstructorDetails);
router.get('/get_all_instructors', getAllInstructors);
router.get('/me', protect, getMyInstructorProfile);
router.get('/:id', getInstructorById);

module.exports = router;
