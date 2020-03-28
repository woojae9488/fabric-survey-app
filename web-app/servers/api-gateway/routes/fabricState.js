const router = require('express').Router();

const controller = require('../controllers/fabricState.js');
const authMiddleware = require('../middlewares/auth.js');

router.use(authMiddleware);

router.post('/departments', controller.addDepartment);
router.get('/departments', controller.queryDepartments);
router.get('/departments/:dName', controller.queryDepartment);
router.put('/departments/:dName', controller.updateDepartment);
router.delete('/departments/:dName', controller.deleteDepartment);

router.post('/departments/:dName/surveys', controller.registerSurvey);
router.get('/departments/:dName/surveys', controller.querySurveys);
router.get('/departments/:dName/surveys/:sCreatedAt', controller.querySurvey);
router.put('/departments/:dName/surveys/:sCreatedAt', controller.updateSurvey);
router.delete('/departments/:dName/surveys/:sCreatedAt', controller.removeSurvey);

router.post('/departments/:dName/surveys/:sCreatedAt/replies', controller.respondReply);
router.get('/departments/:dName/surveys/:sCreatedAt/replies', controller.queryReplies);
router.get('/departments/:dName/surveys/:sCreatedAt/replies/:rStudentId', controller.queryReply);
router.put('/departments/:dName/surveys/:sCreatedAt/replies/:rStudentId', controller.reviseReply);

module.exports = router;
