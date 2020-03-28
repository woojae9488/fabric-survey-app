const router = require('express').Router();
const controller = require('../controllers/survey.js');

router.post('/', controller.register);
router.get('/:dName', controller.queryList);
router.get('/:dName/:sCreatedAt', controller.query);
router.put('/:dName/:sCreatedAt', controller.update);
router.delete('/:dName/:sCreatedAt', controller.remove);

module.exports = router;
