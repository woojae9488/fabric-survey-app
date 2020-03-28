const router = require('express').Router();

const userRouter = require('./user.js');
const departmentRouter = require('./department.js');
const surveyRouter = require('./survey.js');
const replyRouter = require('./reply.js');

router.use('/users', userRouter);
router.use('/departments', departmentRouter);
router.use('/surveys', surveyRouter);
router.use('/replies', replyRouter);

module.exports = router;
