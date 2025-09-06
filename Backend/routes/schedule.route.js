const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const scheduleController = require('../controllers/schedule.controller');
const validate = require('../middleware/validate');

const router = express.Router();

// Protect all class routes and allow only admin role
router.use(protect, authorize('admin'));
router.post('/', scheduleController.createSchedule, validate);
router.post('/period', scheduleController.createPeriod, validate);

module.exports = router;
