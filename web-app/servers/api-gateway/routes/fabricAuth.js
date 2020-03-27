const router = require('express').Router();

const controller = require('../controllers/fabricAuth.js');
const authMiddleware = require('../middlewares/auth.js');

router.use('/users/:uid', authMiddleware);

router.post('/users', controller.signup);
router.get('/users/:uid', controller.checkExistence);
router.put('/users/:uid', controller.changeInfo);
router.delete('/users/:uid', controller.signout);

router.post('/token', controller.signin);
router.get('/token', controller.certifyUser);
router.put('/token', controller.reissueAccessToken);

module.exports = router;
