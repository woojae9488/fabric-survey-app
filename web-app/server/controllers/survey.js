'use strict';

const surveyModel = require('../models/survey.js');
const apiResponse = require('../utils/apiResponse.js');

exports.register = async (req, res, _next) => {
    const { id, survey } = req.body;

    if (!survey) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await surveyModel.register({ id, survey });
    return apiResponse.send(res, modelRes);
};

exports.update = async (req, res, _next) => {
    const { id, survey } = req.body;

    if (!survey) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await surveyModel.update({ id, survey });
    return apiResponse.send(res, modelRes);
};

exports.remove = async (req, res, _next) => {
    const { id } = req.body;
    const { department, createdAt } = req.params;

    const modelRes = await surveyModel.remove({ id, department, createdAt });
    return apiResponse.send(res, modelRes);
};

exports.query = async (req, res, _next) => {
    const { id, name } = req.body;
    const { department, createdAt } = req.params;

    let modelRes;
    if (name === 'manager') {
        modelRes = await surveyModel.query(true, { id, department, createdAt });
    } else {
        modelRes = await surveyModel.query(false, { id, department, createdAt });
    }

    return apiResponse.send(res, modelRes);
};

exports.queryList = async (req, res, _next) => {
    const { id, name } = req.body;
    const { department, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt } = req.params;

    let modelRes;
    if (startCreatedAt && endCreatedAt) {
        if (pageSize && bookmarkCreatedAt) {
            if (name === 'manager') {
                modelRes = await surveyModel.queryListPageByRange(true,
                    { id, department, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt });
            } else {
                modelRes = await surveyModel.queryListPageByRange(false,
                    { id, department, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt });
            }
        } else {
            if (name === 'manager') {
                modelRes = await surveyModel.queryListByRange(true,
                    { id, department, startCreatedAt, endCreatedAt });
            } else {
                modelRes = await surveyModel.queryListByRange(false,
                    { id, department, startCreatedAt, endCreatedAt });
            }
        }
    } else {
        if (pageSize && bookmarkCreatedAt) {
            if (name === 'manager') {
                modelRes = await surveyModel.queryListPage(true,
                    { id, department, pageSize, bookmarkCreatedAt });
            } else {
                modelRes = await surveyModel.queryListPage(false,
                    { id, department, pageSize, bookmarkCreatedAt });
            }
        } else {
            if (name === 'manager') {
                modelRes = await surveyModel.queryList(true, { id, department });
            } else {
                modelRes = await surveyModel.queryList(false, { id, department });
            }
        }
    }

    return apiResponse.send(res, modelRes);
};