const router = require('express').Router();
const controller = require('../controllers/survey.js');

router.get('/:dName', controller.queryList);
router.get('/:dName/:sCreatedAt', controller.query);

module.exports = router;
