const express = require('express');
const protect = require('../middleware/authMiddleware');
const { listPublicCourses, getCourseDetails, buyCourse, myPurchases, updateProgress, myCertificates, getCertificateById } = require('../controllers/studentCourseController');

const router = express.Router();

router.get('/', listPublicCourses);
router.get('/:id', getCourseDetails);
router.post('/enrollments', protect, buyCourse);
router.get('/enrollments/my', protect, myPurchases);
router.put('/enrollments/:id/progress', protect, updateProgress);
router.get('/certificates/my', protect, myCertificates);
router.get('/certificates/:id', protect, getCertificateById);

module.exports = router;
