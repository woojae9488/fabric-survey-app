const network = require('../fabric/network.js');
const apiResponse = require('../utils/apiResponse.js');

exports.registerUser = async information => {
    const { id, password, name, department } = information;

    const walletRes = await network.registerUser(id);
    const networkObj = await network.connect(id);
    const contractRes = await network.invoke(networkObj, 'registerStudent', id, password, name, department);

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
    const contractRes = await network.query(networkObj, 'queryStudent', id);

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
    const contractRes = await network.query(networkObj, 'certifyStudent', id, password);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success', contractRes);
};

exports.updateUser = async information => {
    const { id, newPassword, newName, newDepartment } = information;

    const networkObj = await network.connect(id);
    const contractRes = await network.invoke(networkObj, 'updateStudent', id, newPassword, newName, newDepartment);

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
    const contractRes = await network.invoke(networkObj, 'deleteStudent', id, password);

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};
