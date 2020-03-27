const router = require('express').Router();

const fabricRouter = require('./fabric.js');
const cardRouter = require('./cardRecognize.js');

router.use('/fabric', fabricRouter);
router.use('/card', cardRouter);

module.exports = router;
