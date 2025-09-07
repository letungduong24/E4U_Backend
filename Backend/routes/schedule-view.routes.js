const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const scheduleViewController = require('../controllers/schedule-view.controller');

const router = express.Router();

// Protect all schedule view routes (require authentication)
router.use(protect);

// Routes accessible by all authenticated users (Student, Teacher, Admin)
router.get('/my-schedules', scheduleViewController.getMySchedules);
router.get('/class/:classId', scheduleViewController.getSchedulesByClass);
router.get('/date-range', scheduleViewController.getSchedulesByDateRange);
router.get('/today', scheduleViewController.getTodaysSchedule);
router.get('/:id', scheduleViewController.getScheduleById);
router.get('/upcoming', scheduleViewController.getUpcomingSchedules);
router.get('/calendar', scheduleViewController.getSchedulesForCalendar);

// Routes accessible only by Teacher and Admin
router.get('/stats/:classId', authorize('teacher', 'admin'), scheduleViewController.getScheduleStats);

module.exports = router;
