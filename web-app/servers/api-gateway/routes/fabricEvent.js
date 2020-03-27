const router = require('express').Router();

const controller = require('../controllers/fabricEvent.js');

router.get('/', controller.queryEvents);

module.exports = router;
