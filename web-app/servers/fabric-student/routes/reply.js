const router = require('express').Router();
const controller = require('../controllers/reply.js');

router.post('/', controller.respond);
router.get('/:dName/:sCreatedAt', controller.queryAll);
router.get('/:dName/:sCreatedAt/:rStudentId', controller.query);
router.put('/:dName/:sCreatedAt/:rStudentId', controller.revise);

module.exports = router;
