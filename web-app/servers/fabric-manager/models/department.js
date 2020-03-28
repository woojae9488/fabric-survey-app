const network = require('../fabric/network.js');
const apiResponse = require('../utils/apiResponse.js');

exports.addDepartment = async information => {
    const { id, dName, dParent } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.invoke(networkObj, 'addDepartment', dName, dParent);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.queryDepartments = async information => {
    const { id } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(networkObj, 'queryDepartments');

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.queryDepartment = async information => {
    const { id, dName } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(networkObj, 'queryDepartment', dName);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.updateDepartment = async information => {
    const { id, dName, dNewParent } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.invoke(networkObj, 'updateDepartment', id, dName, dNewParent);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.deleteDepartment = async information => {
    const { id, dName } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.invoke(networkObj, 'deleteDepartment', dName);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};
