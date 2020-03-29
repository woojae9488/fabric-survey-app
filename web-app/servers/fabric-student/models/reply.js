const network = require('../fabric/network.js');
const apiResponse = require('../utils/apiResponse.js');

exports.respond = async information => {
    const { id, reply } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.invoke(networkObj, 'respond', reply);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.queryAll = async information => {
    const { id, dName, sCreatedAt } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(networkObj, 'queryReplies', dName, sCreatedAt);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryAllByRange = async information => {
    const { id, dName, sCreatedAt, startStudentID, endStudentID } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(
        networkObj,
        'queryRepliesByRange',
        dName,
        sCreatedAt,
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
    const { id, dName, sCreatedAt, startStudentID, endStudentID, pageSize, bookmarkStudentID } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(
        networkObj,
        'queryRepliesByRangeWithPagination',
        dName,
        sCreatedAt,
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

exports.query = async information => {
    const { id, dName, sCreatedAt, rStudentId } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(networkObj, 'queryReply', dName, sCreatedAt, rStudentId);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.revise = async information => {
    const { id, dName, sCreatedAt, rStudentId, reply } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.invoke(networkObj, 'revise', dName, sCreatedAt, rStudentId, reply);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};
