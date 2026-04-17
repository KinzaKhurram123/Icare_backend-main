const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes protected - user must be logged in
router.use(protect);

router.post('/critical-alert', notificationController.sendCriticalAlert);
router.post('/status-update', notificationController.sendStatusUpdate);
router.post('/report-ready', notificationController.sendReportReady);
router.get('/me', notificationController.getMyNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.get('/preferences/:userId', notificationController.getPreferences);
router.put('/preferences/:userId', notificationController.updatePreferences);
router.get('/history/:userId', notificationController.getHistory);

module.exports = router;
