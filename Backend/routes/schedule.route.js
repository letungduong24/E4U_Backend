const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const scheduleController = require('../controllers/schedule.controller');
const validate = require('../middleware/validate');

const router = express.Router();

// Protect all schedule routes and allow only admin role
router.use(protect, authorize('admin'));

// Schedule CRUD operations
router.get('/', scheduleController.getAllSchedules);
router.get('/:id', scheduleController.getSchedule);
router.post('/', scheduleController.createSchedule, validate);
router.put('/:id', scheduleController.updateSchedule, validate);
router.delete('/:id', scheduleController.deleteSchedule);

// Period operations
router.post('/period', scheduleController.createPeriod, validate);
router.put('/:id/periods/:periodIndex', scheduleController.updatePeriod, validate);
router.delete('/:id/periods/:periodIndex', scheduleController.deletePeriod);

module.exports = router;
