const network = require('../fabric/network.js');
const apiResponse = require('../utils/apiResponse.js');

exports.respond = async information => {
    const { id, reply } = information;

    const networkObj = await network.connect(false, id);
    const contractRes = await network.invoke(networkObj, 'respond', reply);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.revise = async information => {
    const { id, reply } = information;

    const networkObj = await network.connect(false, id);
    const contractRes = await network.invoke(networkObj, 'revise', reply);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.query = async (isManager, information) => {
    const { id, department, surveyCreatedAt } = information;

    const networkObj = await network.connect(isManager, id);
    const contractRes = await network.query(networkObj, 'queryReply', department, surveyCreatedAt, id);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryAll = async information => {
    const { id, department, surveyCreatedAt } = information;

    const networkObj = await network.connect(true, id);
    const contractRes = await network.query(networkObj, 'queryReplies', department, surveyCreatedAt);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryAllByRange = async information => {
    const { id, department, surveyCreatedAt, startStudentID, endStudentID } = information;

    const networkObj = await network.connect(true, id);
    const contractRes = await network.query(
        networkObj,
        'queryRepliesByRange',
        department,
        surveyCreatedAt,
        startStudentID,
        endStudentID,
    );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryPageByRange = async information => {
    const { id, department, surveyCreatedAt, startStudentID, endStudentID, pageSize, bookmarkStudentID } = information;

    const networkObj = await network.connect(true, id);
    const contractRes = await network.query(
        networkObj,
        'queryRepliesByRangeWithPagination',
        department,
        surveyCreatedAt,
        startStudentID,
        endStudentID,
        pageSize,
        bookmarkStudentID,
    );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};
