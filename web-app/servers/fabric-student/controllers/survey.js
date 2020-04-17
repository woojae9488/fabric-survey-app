const surveyModel = require('../models/survey.js');
const apiResponse = require('../utils/apiResponse.js');

exports.queryList = async (req, res) => {
    const { dName } = req.params;
    const { id, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt } = req.query;

    let modelRes;
    if (startCreatedAt && endCreatedAt) {
        if (pageSize && bookmarkCreatedAt) {
            modelRes = await surveyModel.queryListPageByRange({
                id,
                dName,
                startCreatedAt,
                endCreatedAt,
                pageSize,
                bookmarkCreatedAt,
            });
        } else {
            modelRes = await surveyModel.queryListByRange({ id, dName, startCreatedAt, endCreatedAt });
        }
    } else if (pageSize && bookmarkCreatedAt) {
        modelRes = await surveyModel.queryListPage({ id, dName, pageSize, bookmarkCreatedAt });
    } else {
        modelRes = await surveyModel.queryList({ id, dName });
    }

    return apiResponse.send(res, modelRes);
};

exports.query = async (req, res) => {
    const { id } = req.query;
    const { dName, sCreatedAt } = req.params;

    const modelRes = await surveyModel.query({ id, dName, sCreatedAt });
    return apiResponse.send(res, modelRes);
};
