'use strict';

const network = require('../fabric/network.js');
const authenticateUtil = require('../utils/authenticate.js');
const apiResponse = require('../utils/apiResponse.js');

exports.signup = async (isManager, information) => {
    const { id, password, name, departments } = information;

    const walletRes = await network.registerUser(isManager, id);
    const networkObj = await network.connect(isManager, id);
    let contractRes;
    if (isManager) {
        contractRes = await network.invoke(networkObj, 'registerManager', id, password, departments);
    } else {
        contractRes = await network.invoke(networkObj, 'registerStudent', id, password, name, departments);
    }

    const error = walletRes.error || networkObj.error || contractRes.error;
    if (error) {
        const status = walletRes.status || networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.signin = async (isManager, information) => {
    const { id, password } = information;

    const networkObj = await network.connect(isManager, id);
    let contractRes;
    if (isManager) {
        contractRes = await network.query(networkObj, 'certifyManager', id, password);
    } else {
        contractRes = await network.query(networkObj, 'certifyStudent', id, password);
    }

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    const { hashedPw, name, departments } = JSON.parse(contractRes);
    const accessToken = authenticateUtil.generateAccessToken({ id, name, departments });
    const refreshToken = authenticateUtil.generateRefreshToken({ id, hashedPw });

    return apiResponse.createModelRes(200, 'Success', { accessToken, refreshToken });
};

exports.changeInfo = async (isManager, information) => {
    const { id, newPassword, newName, newDepartments } = information;

    const networkObj = await network.connect(isManager, id);
    let contractRes;
    if (isManager) {
        contractRes = await network.invoke(networkObj, 'updateManager', id, newPassword, newDepartments);
    } else {
        contractRes = await network.invoke(networkObj, 'updateStudent', id, newPassword, newName, newDepartments);
    }

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.signout = async (isManager, information) => {
    const { id, password } = information;

    const networkObj = await network.connect(isManager, id);
    let contractRes;
    if (isManager) {
        contractRes = await network.invoke(networkObj, 'deleteManager', id, password);
    } else {
        contractRes = await network.invoke(networkObj, 'deleteStudent', id, password);
    }

    const error = networkObj.error || contractRes.error;
    if (error) {
        const status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
}

exports.certifyUser = async (token) => {
    try {
        const tokenRes = await authenticateUtil.certifyAccessToken(token);

        return apiResponse.createModelRes(200, 'Success', tokenRes);
    } catch (err) {
        return apiResponse.createModelRes(401, 'This token is invalid');
    }
};

exports.reissueAccessToken = async (isManager, refreshToken) => {
    try {
        const decodedToken = await authenticateUtil.decodedRefreshToken(refreshToken);
        const id = decodedToken.id;

        const networkObj = await network.connect(isManager, id);
        let contractRes;
        if (isManager) {
            contractRes = await network.query(networkObj, 'queryManager', id);
        } else {
            contractRes = await network.query(networkObj, 'queryStudent', id);
        }

        const error = networkObj.error || contractRes.error;
        if (error) {
            const status = networkObj.status || contractRes.status;
            return apiResponse.createModelRes(status, error);
        }

        const { hashedPw, name, departments } = JSON.parse(contractRes);
        await authenticateUtil.certifyRefreshToken(refreshToken, hashedPw);
        const accessToken = authenticateUtil.generateAccessToken({ id, name, departments });

        return apiResponse.createModelRes(200, 'Success', { accessToken });
    } catch (err) {
        return apiResponse.createModelRes(400, 'This token is invalid');
    }
};
