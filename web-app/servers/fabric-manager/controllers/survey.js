const surveyModel = require('../models/survey.js');
const apiResponse = require('../utils/apiResponse.js');

exports.register = async (req, res) => {
    const { id, survey } = req.body;

    if (!survey) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await surveyModel.register({ id, survey });
    return apiResponse.send(res, modelRes);
};

exports.queryList = async (req, res) => {
    const { id } = req.body;
    const { dName } = req.params;
    const { startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt } = req.query;

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
    const { id } = req.body;
    const { dName, sCreatedAt } = req.params;

    const modelRes = await surveyModel.query({ id, dName, sCreatedAt });
    return apiResponse.send(res, modelRes);
};

exports.update = async (req, res) => {
    const { id, survey } = req.body;
    const { dName, sCreatedAt } = req.params;

    if (!survey) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await surveyModel.update({ id, dName, sCreatedAt, survey });
    return apiResponse.send(res, modelRes);
};

exports.remove = async (req, res) => {
    const { id } = req.body;
    const { dName, sCreatedAt } = req.params;

    const modelRes = await surveyModel.remove({ id, dName, sCreatedAt });
    return apiResponse.send(res, modelRes);
};
