const router = require('express').Router();

const controller = require('../controllers/event.js');

router.get('/events', controller.queryEvents);

module.exports = router;
