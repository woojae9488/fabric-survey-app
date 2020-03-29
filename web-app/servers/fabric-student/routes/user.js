const router = require('express').Router();
const controller = require('../controllers/user.js');

router.post('/', controller.registerUser);
router.get('/:uid/check', controller.checkExistence);
router.get('/:uid/query', controller.queryUser);
router.get('/:uid/certify', controller.certifyUser);
router.put('/:uid', controller.updateUser);
router.delete('/:uid', controller.deleteUser);

module.exports = router;
