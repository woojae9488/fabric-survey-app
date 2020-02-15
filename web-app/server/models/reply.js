'use strict';

const network = require('../fabric/network.js');
const config = require('../fabric/config.js').connection;
const connectionType = config.connectionType;
const apiResponse = require('../utils/apiResponse.js');

exports.respond = async (information) => {
    const { id, reply } = information;

    const networkObj = await network.connect(connectionType.STUDENT, id);
    const contractRes = await network.invoke(networkObj, 'respond', reply);

    let error = networkObj.error || contractRes.error;
    if (error) {
        let status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.revise = async (information) => {
    const { id, reply } = information;

    const networkObj = await network.connect(connectionType.STUDENT, id);
    const contractRes = await network.invoke(networkObj, 'revise', reply);

    let error = networkObj.error || contractRes.error;
    if (error) {
        let status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.query = async (connType, information) => {
    const { id, department, surveyCreatedAt } = information;

    const networkObj = await network.connect(connType, id);
    const contractRes = await network.query(networkObj, 'queryReply', department, surveyCreatedAt, id);

    let error = networkObj.error || contractRes.error;
    if (error) {
        let status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryAll = async (information) => {
    const { id, department, surveyCreatedAt } = information;

    const networkObj = await network.connect(connectionType.MANAGER, id);
    const contractRes = await network.query(networkObj, 'queryReplies', department, surveyCreatedAt);

    let error = networkObj.error || contractRes.error;
    if (error) {
        let status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryAllByRange = async (information) => {
    const { id, department, surveyCreatedAt, startStudentID, endStudentID } = information;

    const networkObj = await network.connect(connectionType.MANAGER, id);
    const contractRes = await network.query(networkObj, 'queryRepliesByRange',
        department, surveyCreatedAt, startStudentID, endStudentID);

    let error = networkObj.error || contractRes.error;
    if (error) {
        let status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryPageByRange = async (information) => {
    const { id, department, surveyCreatedAt, startStudentID, endStudentID, pageSize, bookmarkStudentID } = information;

    const networkObj = await network.connect(connectionType.MANAGER, id);
    const contractRes = await network.query(networkObj, 'queryRepliesByRangeWithPagination',
        department, surveyCreatedAt, startStudentID, endStudentID, pageSize, bookmarkStudentID);

    let error = networkObj.error || contractRes.error;
    if (error) {
        let status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};
