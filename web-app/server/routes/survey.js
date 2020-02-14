'use strict';

const surveyRouter = require('express').Router();
const controller = require('../controllers/survey.js');
const authMiddleware = require('../middlewares/auth.js');

surveyRouter.use(authMiddleware);

surveyRouter.post('/', controller.register);
surveyRouter.put('/', controller.update);
surveyRouter.get('/:department', controller.queryList);
surveyRouter.get('/:department/:createdAt', controller.query);
surveyRouter.delete('/:department/:createdAt', controller.remove);

module.exports = surveyRouter;