const router = require('express').Router();
const controller = require('../controllers/reply.js');

router.get('/:dName/:sCreatedAt', controller.queryAll);
router.get('/:dName/:sCreatedAt/:rStudentId', controller.query);

module.exports = router;
