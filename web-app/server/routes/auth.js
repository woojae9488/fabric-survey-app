'use strict';

const authRouter = require('express').Router();
const controller = require('../controllers/auth.js');
const authMiddleware = require('../middlewares/auth.js');

authRouter.use('/users/:role/:uid', authMiddleware);

authRouter.post('/users/:role', controller.signup);
authRouter.put('/users/:role/:uid', controller.changeInfo);
authRouter.delete('/users/:role/:uid', controller.signout);

authRouter.post('/tokens/:role', controller.signin);
authRouter.get('/tokens/:role', controller.certifyUser);
authRouter.put('/tokens/:role', controller.reissueAccessToken);

module.exports = authRouter;