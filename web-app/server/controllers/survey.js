'use strict';

const config = require('../fabric/config.js').connection;
const connectionType = config.connectionType;
const surveyModel = require('../models/survey.js');
const apiResponse = require('../utils/apiResponse.js');

exports.register = async (req, res, next) => {
    const { id, survey } = req.body;

    if (!survey) { return apiResponse.badRequest(res); }

    let modelRes = await surveyModel.register({ id, survey });
    return apiResponse.send(res, modelRes);
};

exports.update = async (req, res, next) => {
    const { id, survey } = req.body;

    if (!survey) { return apiResponse.badRequest(res); }

    let modelRes = await surveyModel.update({ id, survey });
    return apiResponse.send(res, modelRes);
};

exports.remove = async (req, res, next) => {
    const { id } = req.body;
    const { department, createdAt } = req.params;

    let modelRes = await surveyModel.remove({ id, department, createdAt });
    return apiResponse.send(res, modelRes);
};

exports.query = async (req, res, next) => {
    const { id, name } = req.body;
    const { department } = req.params;

    let modelRes;
    if (name === 'manager') {
        modelRes = await surveyModel.query(connectionType.MANAGER, { id, department, createdAt });
    } else {
        modelRes = await surveyModel.query(connectionType.STUDENT, { id, department, createdAt });
    }

    return apiResponse.send(res, modelRes);
};

exports.queryList = async (req, res, next) => {
    const { id, name } = req.body;
    const { department, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt } = req.params;

    let modelRes;
    if (startCreatedAt && endCreatedAt) {
        if (pageSize && bookmarkCreatedAt) {
            if (name === 'manager') {
                modelRes = await surveyModel.queryListPageByRange(connectionType.MANAGER,
                    { id, department, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt });
            } else {
                modelRes = await surveyModel.queryListPageByRange(connectionType.STUDENT,
                    { id, department, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt });
            }
        } else {
            if (name === 'manager') {
                modelRes = await surveyModel.queryListByRange(connectionType.MANAGER,
                    { id, department, startCreatedAt, endCreatedAt });
            } else {
                modelRes = await surveyModel.queryListByRange(connectionType.STUDENT,
                    { id, department, startCreatedAt, endCreatedAt });
            }
        }
    } else {
        if (pageSize && bookmarkCreatedAt) {
            if (name === 'manager') {
                modelRes = await surveyModel.queryListPage(connectionType.MANAGER,
                    { id, department, pageSize, bookmarkCreatedAt });
            } else {
                modelRes = await surveyModel.queryListPage(connectionType.STUDENT,
                    { id, department, pageSize, bookmarkCreatedAt });
            }
        } else {
            if (name === 'manager') {
                modelRes = await surveyModel.queryList(connectionType.MANAGER, { id, department });
            } else {
                modelRes = await surveyModel.queryList(connectionType.STUDENT, { id, department });
            }
        }
    }

    return apiResponse.send(res, modelRes);
};