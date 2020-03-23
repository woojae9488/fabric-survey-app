const router = require('express').Router();

const controller = require('../controllers/fabric.js');

router.use('/', controller.pass);

module.exports = router;
