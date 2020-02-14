'use strict';

const authRouter = require('express').Router();
const controller = require('../controllers/auth.js');

authRouter.post('/signup', controller.signup);
authRouter.post('/signin', controller.signin);
authRouter.delete('/signout', controller.signout);
authRouter.get('/check', controller.certifyUser);
authRouter.get('/reissuance', controller.reissueAccessToken);

module.exports = authRouter;