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

exports.queryAll = async (req, res) => {
    const { dName, sCreatedAt } = req.params;
    const { id, startStudentID, endStudentID, pageSize, bookmarkStudentId } = req.query;

    let modelRes;
    if (startStudentID && endStudentID) {
        if (pageSize && bookmarkStudentId) {
            modelRes = await replyModel.queryPageByRange({
                id,
                dName,
                sCreatedAt,
                startStudentID,
                endStudentID,
                pageSize,
                bookmarkStudentId,
            });
        } else {
            modelRes = await replyModel.queryAllByRange({ id, dName, sCreatedAt, startStudentID, endStudentID });
        }
    } else {
        modelRes = await replyModel.queryAll({ id, dName, sCreatedAt });
    }

    return apiResponse.send(res, modelRes);
};

exports.query = async (req, res) => {
    const { id } = req.query;
    const { dName, sCreatedAt, rStudentId } = req.params;

    const modelRes = await replyModel.query({ id, dName, sCreatedAt, rStudentId });
    return apiResponse.send(res, modelRes);
};

exports.revise = async (req, res) => {
    const { id, reply } = req.body;
    const { dName, sCreatedAt, rStudentId } = req.params;

    if (!reply) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await replyModel.revise({ id, dName, sCreatedAt, rStudentId, reply });
    return apiResponse.send(res, modelRes);
};
