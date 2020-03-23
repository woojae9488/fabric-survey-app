const router = require('express').Router();

const fabricRouter = require('./fabric.js');
const cardRecognizeRouter = require('./cardRecognize.js');

router.use('/fabric', fabricRouter);
router.use('/cards', cardRecognizeRouter);

module.exports = router;
