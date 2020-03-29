const router = require('express').Router();
const controller = require('../controllers/department.js');

router.get('/', controller.queryDepartments);
router.get('/:dName', controller.queryDepartment);

module.exports = router;
