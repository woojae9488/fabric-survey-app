const network = require('../fabric/network.js');
const apiResponse = require('../utils/apiResponse.js');

exports.queryList = async information => {
    const { id, dName } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(networkObj, 'querySurveyInfos', dName);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryListPage = async information => {
    const { id, dName, pageSize, bookmarkCreatedAt } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(
        networkObj,
        'querySurveyInfosWithPagination',
        dName,
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

exports.queryListByRange = async information => {
    const { id, dName, startCreatedAt, endCreatedAt } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(networkObj, 'querySurveyInfosByRange', dName, startCreatedAt, endCreatedAt);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryListPageByRange = async information => {
    const { id, dName, startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(
        networkObj,
        'querySurveyInfosByRangeWithPagination',
        dName,
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

exports.query = async information => {
    const { id, dName, sCreatedAt } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(networkObj, 'querySurvey', dName, sCreatedAt);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};
