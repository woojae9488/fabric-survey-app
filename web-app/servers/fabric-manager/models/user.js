const network = require('../fabric/network.js');
const apiResponse = require('../utils/apiResponse.js');

exports.registerUser = async information => {
    const { id, password, departments } = information;

    const walletRes = await network.registerUser(id);
    const networkObj = await network.connect(id);
    const contractRes = await network.invoke(networkObj, 'registerManager', id, password, departments);

    const error = walletRes.error || networkObj.error || contractRes.error;
    if (error) {
        const status = walletRes.status || networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.checkExistence = async information => {
    const { uid } = information;

    const userExists = await network.checkUserExists(uid);
    const { error, status } = userExists;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', { userExists });
};

exports.queryUser = async information => {
    const { id } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(networkObj, 'queryManager', id);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.certifyUser = async information => {
    const { id, password } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.query(networkObj, 'certifyManager', id, password);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.updateUser = async information => {
    const { id, newPassword, newDepartments } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.invoke(networkObj, 'updateManager', id, newPassword, newDepartments);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.deleteUser = async information => {
    const { id, password } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.invoke(networkObj, 'deleteManager', id, password);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};
