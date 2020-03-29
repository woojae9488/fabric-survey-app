const network = require('../fabric/network.js');
const apiResponse = require('../utils/apiResponse.js');

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
