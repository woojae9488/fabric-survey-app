const replyRouter = require('express').Router();
const controller = require('../controllers/reply.js');
const authMiddleware = require('../middlewares/auth.js');

replyRouter.use(authMiddleware);

replyRouter.post('/', controller.respond);
replyRouter.put('/', controller.revise);
replyRouter.get('/:department/:surveyCreatedAt', controller.queryAll);
replyRouter.get('/:department/:surveyCreatedAt/:uid', controller.query);

module.exports = replyRouter;
