const router = require('express').Router();
const controller = require('../controllers/department.js');

router.post('/', controller.addDepartment);
router.get('/', controller.queryDepartments);
router.get('/:dName', controller.queryDepartment);
router.put('/:dName', controller.updateDepartment);
router.delete('/:dName', controller.deleteDepartment);

module.exports = router;
