const router = require('express').Router();

const authRouter = require('./auth.js');
const surveyRouter = require('./survey.js');
const replyRouter = require('./reply.js');

router.use('/auth', authRouter);
router.use('/surveys', surveyRouter);
router.use('/replies', replyRouter);

module.exports = router;
