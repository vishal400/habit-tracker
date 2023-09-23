const express = require('express');
const homeController = require('../controllers/home_controller');

const router = express.Router();

router.get('/', homeController.home);
router.post('/add-habit', homeController.addHabit);
router.get('/remove-habit', homeController.removeHabit);
router.get('/change-status', homeController.changeStatus)

module.exports = router;