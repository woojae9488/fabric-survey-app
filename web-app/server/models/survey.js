const network = require('../fabric/network.js');
const apiResponse = require('../utils/apiResponse.js');

exports.register = async information => {
    const { id, survey } = information;

    const networkObj = await network.connect(true, id);
    const contractRes = await network.invoke(networkObj, 'register', survey);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.update = async information => {
    const { id, survey } = information;

    const networkObj = await network.connect(true, id);
    const contractRes = await network.invoke(networkObj, 'update', survey);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.remove = async information => {
    const { id, department, createdAt } = information;

    const networkObj = await network.connect(true, id);
    const contractRes = await network.invoke(networkObj, 'remove', department, createdAt, id);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.query = async (isManager, information) => {
    const { id, department, createdAt } = information;

    const networkObj = await network.connect(isManager, id);
    const contractRes = await network.query(networkObj, 'querySurvey', department, createdAt);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryList = async (isManager, information) => {
    const { id, department } = information;

    const networkObj = await network.connect(isManager, id);
    const contractRes = await network.query(networkObj, 'querySurveyInfos', department);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryListPage = async (isManager, information) => {
    const { id, department, pageSize, bookmarkCreatedAt } = information;

    const networkObj = await network.connect(isManager, id);
    const contractRes = await network.query(
        networkObj,
        'querySurveyInfosWithPagination',
        department,
        pageSize,
        bookmarkCreatedAt,
    );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryListByRange = async (isManager, information) => {
    const { id, department, startCreatedAt, endCreatedAt } = information;

    const networkObj = await network.connect(isManager, id);
    const contractRes = await network.query(
        networkObj,
        'querySurveyInfosByRange',
        department,
        startCreatedAt,
        endCreatedAt,
    );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryListPageByRange = async (isManager, information) => {
    const { id, department, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt } = information;

    const networkObj = await network.connect(isManager, id);
    const contractRes = await network.query(
        networkObj,
        'querySurveyInfosByRangeWithPagination',
        department,
        startCreatedAt,
        endCreatedAt,
        pageSize,
        bookmarkCreatedAt,
    );

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};
