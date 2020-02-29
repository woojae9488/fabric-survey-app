const replyModel = require('../models/reply.js');
const apiResponse = require('../utils/apiResponse.js');

exports.respond = async (req, res) => {
    const { id, reply } = req.body;

    if (!reply) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await replyModel.respond({ id, reply });
    return apiResponse.send(res, modelRes);
};

exports.revise = async (req, res) => {
    const { id, reply } = req.body;

    if (!reply) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await replyModel.revise({ id, reply });
    return apiResponse.send(res, modelRes);
};

exports.query = async (req, res) => {
    const { id, name } = req.body;
    const { department, surveyCreatedAt, uid } = req.params;

    let modelRes;
    if (name === 'manager') {
        modelRes = await replyModel.query(true, { id: uid, department, surveyCreatedAt });
    } else {
        if (id !== uid) {
            return apiResponse.badRequest(res);
        }
        modelRes = await replyModel.query(false, { id, department, surveyCreatedAt });
    }

    return apiResponse.send(res, modelRes);
};

exports.queryAll = async (req, res) => {
    const { id } = req.body;
    const { department, surveyCreatedAt, startStudentID, endStudentID, pageSize, bookmarkStudentId } = req.params;

    let modelRes;
    if (startStudentID && endStudentID) {
        if (pageSize && bookmarkStudentId) {
            modelRes = await replyModel.queryPageByRange({
                id,
                department,
                surveyCreatedAt,
                startStudentID,
                endStudentID,
                pageSize,
                bookmarkStudentId,
            });
        } else {
            modelRes = await replyModel.queryAllByRange({
                id,
                department,
                surveyCreatedAt,
                startStudentID,
                endStudentID,
            });
        }
    } else {
        modelRes = await replyModel.queryAll({ id, department, surveyCreatedAt });
    }

    return apiResponse.send(res, modelRes);
};
