const router = require('express').Router();

const controller = require('../controllers/cardRecognize.js');

router.post('/student-card', controller.recognizeStudentCard);

module.exports = router;
