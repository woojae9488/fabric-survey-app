'use strict';

const network = require('../fabric/network.js');
const config = require('../fabric/config.js').connection;
const connectionType = config.connectionType;
const apiResponse = require('../utils/apiResponse.js');

exports.register = async (information) => {
    const { id, survey } = information;
    const surveyBuffer = Buffer.from(JSON.stringify(survey));

    const networkObj = await network.connect(connectionType.MANAGER, id);
    const contractRes = await network.invoke(networkObj, "register", surveyBuffer);

    let error = networkObj.error || contractRes.error;
    let status = networkObj.status || contractRes.status;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.update = async (information) => {
    const { id, survey } = information;
    const surveyBuffer = Buffer.from(JSON.stringify(survey));

    const networkObj = await network.connect(connectionType.MANAGER, id);
    const contractRes = await network.invoke(networkObj, "update", surveyBuffer);

    let error = networkObj.error || contractRes.error;
    let status = networkObj.status || contractRes.status;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.remove = async (information) => {
    const { id, department, createdAt } = information;

    const networkObj = await network.connect(connectionType.MANAGER, id);
    const contractRes = await network.invoke(networkObj, "remove", department, createdAt, id);

    let error = networkObj.error || contractRes.error;
    let status = networkObj.status || contractRes.status;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.query = async (connType, information) => {
    const { id, department, createdAt } = information;

    const networkObj = await network.connect(connType, id);
    const contractRes = await network.invoke(networkObj, "querySurvey", department, createdAt);

    let error = networkObj.error || contractRes.error;
    let status = networkObj.status || contractRes.status;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryList = async (connType, information) => {
    const { id, department } = information;

    const networkObj = await network.connect(connType, id);
    const contractRes = await network.invoke(networkObj, "querySurveyInfos", department);

    let error = networkObj.error || contractRes.error;
    let status = networkObj.status || contractRes.status;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryListPage = async (connType, information) => {
    const { id, department, pageSize, bookmarkCreatedAt } = information;

    const networkObj = await network.connect(connType, id);
    const contractRes = await network.invoke(networkObj, "querySurveyInfosWithPagination", department, pageSize, bookmarkCreatedAt);

    let error = networkObj.error || contractRes.error;
    let status = networkObj.status || contractRes.status;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryListByRange = async (connType, information) => {
    const { id, department, startCreatedAt, endCreatedAt } = information;

    const networkObj = await network.connect(connType, id);
    const contractRes = await network.invoke(networkObj, "querySurveyInfosByRange", department, startCreatedAt, endCreatedAt);

    let error = networkObj.error || contractRes.error;
    let status = networkObj.status || contractRes.status;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryListPageByRange = async (connType, information) => {
    const { id, department, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt } = information;

    const networkObj = await network.connect(connType, id);
    const contractRes = await network.invoke(networkObj, "querySurveyInfosByRangeWithPagination", department, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt);

    let error = networkObj.error || contractRes.error;
    let status = networkObj.status || contractRes.status;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};
