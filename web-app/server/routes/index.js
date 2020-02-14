'use strict';

const router = require('express').Router();

const authRouter = require('./auth.js');
const surveyRouter = require('./survey.js');

router.use('/auth', authRouter);
router.use('/surveys', surveyRouter);

module.exports = router;