const router = require('express').Router();

const fabricAuthRouter = require('./fabricAuth.js');
const fabricStateRouter = require('./fabricState.js');
const fabricEventRouter = require('./fabricEvent.js');
const addressingMiddleware = require('../middlewares/addressing.js');

router.use(addressingMiddleware);

router.use('/auth', fabricAuthRouter);
router.use('/state', fabricStateRouter);
router.use('/events', fabricEventRouter);

module.exports = router;
