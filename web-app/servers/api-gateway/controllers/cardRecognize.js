const api = require('../utils/api.js');

exports.recognizeStudentCard = async (req, res) => {
    try {
        const apiResult = await api.instance(process.env.ADDR_CARD_RECOGNIZE).post('/student-card', req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};
