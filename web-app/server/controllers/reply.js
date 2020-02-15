'use strict';

const config = require('../fabric/config.js').connection;
const connectionType = config.connectionType;
const replyModel = require('../models/reply.js');
const apiResponse = require('../utils/apiResponse.js');

exports.respond = async (req, res, next) => {
    const { id, reply } = req.body;

    if (!reply) {
        return apiResponse.badRequest(res);
    }

    let modelRes = await replyModel.respond({ id, reply });
    return apiResponse.send(res, modelRes);
};

exports.revise = async (req, res, next) => {
    const { id, reply } = req.body;

    if (!reply) {
        return apiResponse.badRequest(res);
    }

    let modelRes = await replyModel.revise({ id, reply });
    return apiResponse.send(res, modelRes);
};

exports.query = async (req, res, next) => {
    const { id, name } = req.body;
    const { department, surveyCreatedAt } = req.params;

    let modelRes;
    if (name === 'manager') {
        modelRes = await replyModel.query(connectionType.MANAGER, { id, department, surveyCreatedAt });
    } else {
        modelRes = await replyModel.query(connectionType.STUDENT, { id, department, surveyCreatedAt });
    }

    return apiResponse.send(res, modelRes);
};

exports.queryAll = async (req, res, next) => {
    const { id } = req.body;
    const { department, surveyCreatedAt, startStudentID, endStudentID, pageSize, bookmarkStudentId } = req.params;

    let modelRes;
    if (startStudentID && endStudentID) {
        if (pageSize && bookmarkStudentId) {
            modelRes = await replyModel.queryPageByRange(
                { id, department, surveyCreatedAt, startStudentID, endStudentID, pageSize, bookmarkStudentId });
        } else {
            modelRes = await replyModel.queryAllByRange(
                { id, department, surveyCreatedAt, startStudentID, endStudentID });
        }
    } else {
        modelRes = await replyModel.queryAll({ id, department, surveyCreatedAt });
    }

    return apiResponse.send(res, modelRes);
};