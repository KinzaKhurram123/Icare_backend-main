const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

// Get all notifications
router.get('/', protect, notificationController.getUserNotifications);

// Mark all as read (must come before /:notificationId routes)
router.put('/mark-all-read', protect, notificationController.markAllAsRead);

// Mark single notification as read
router.put('/:notificationId/read', protect, notificationController.markAsRead);

// Delete notification
router.delete('/:notificationId', protect, notificationController.deleteNotification);

module.exports = router;
