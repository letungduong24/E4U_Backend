const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const scheduleController = require('../controllers/schedule.controller');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect); 
router.get('/my-schedule', scheduleController.mySchedule);
router.use('/upcoming', scheduleController.upcomingSchedulesForUser);

router.use(authorize('admin'));
router.post('/', validate, scheduleController.createSchedule);
router.get('/:id', scheduleController.listSchedulesByClassId);
router.put('/:id', validate, scheduleController.updateSchedule);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
