'use strict';

const network = require('../fabric/network.js');
const config = require('../fabric/config.js').connection;
const connectionType = config.connectionType;
const authenticateUtil = require('../utils/authenticate.js');
const apiResponse = require('../utils/apiResponse.js');

exports.signup = async (connType, information) => {
    const { id, password, name, departments } = information;

    let walletRes = await network.registerUser(connType, id);
    let networkObj = await network.connect(connType, id);
    let contractRes;
    if (connType === connectionType.MANAGER) {
        contractRes = await network.invoke(networkObj, 'registerManager', id, password, departments);
    } else {
        contractRes = await network.invoke(networkObj, 'registerStudent', id, password, name, departments);
    }

    let error = walletRes.error || networkObj.error || contractRes.error;
    if (error) {
        let status = walletRes.status || networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.signin = async (connType, information) => {
    const { id, password } = information;

    let networkObj = await network.connect(connType, id);
    let contractRes;
    if (connType === connectionType.MANAGER) {
        contractRes = await network.query(networkObj, 'certifyManager', id, password);
    } else {
        contractRes = await network.query(networkObj, 'certifyStudent', id, password);
    }

    let error = networkObj.error || contractRes.error;
    if (error) {
        let status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    let { hashedPw, name, departments } = JSON.parse(contractRes);
    let accessToken = authenticateUtil.generateAccessToken({ id, name, departments });
    let refreshToken = authenticateUtil.generateRefreshToken({ id, hashedPw });

    return apiResponse.createModelRes(200, 'Success', { accessToken, refreshToken });
};

exports.changeInfo = async (connType, information) => {
    const { id, newPassword, newName, newDepartments } = information;

    let networkObj = await network.connect(connType, id);
    let contractRes;
    if (connType === connectionType.MANAGER) {
        contractRes = await network.invoke(networkObj, 'updateManager', id, newPassword, newDepartments);
    } else {
        contractRes = await network.invoke(networkObj, 'updateStudent', id, newPassword, newName, newDepartments);
    }

    let error = networkObj.error || contractRes.error;
    if (error) {
        let status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.signout = async (connType, information) => {
    const { id, password } = information;

    let networkObj = await network.connect(connType, id);
    let contractRes;
    if (connType === connectionType.MANAGER) {
        contractRes = await network.invoke(networkObj, 'deleteManager', id, password);
    } else {
        contractRes = await network.invoke(networkObj, 'deleteStudent', id, password);
    }

    let error = networkObj.error || contractRes.error;
    if (error) {
        let status = networkObj.status || contractRes.status;
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
}

exports.certifyUser = async (token) => {
    try {
        let tokenRes = await authenticateUtil.certifyAccessToken(token);

        return apiResponse.createModelRes(200, 'Success', tokenRes);
    } catch (err) {
        return apiResponse.createModelRes(401, 'This token is invalid');
    }
};

exports.reissueAccessToken = async (connType, refreshToken) => {
    try {
        let decodedToken = await authenticateUtil.decodedRefreshToken(refreshToken);
        let id = decodedToken.id;

        let networkObj = await network.connect(connType, id);
        let contractRes;
        if (connType === connectionType.MANAGER) {
            contractRes = await network.query(networkObj, 'queryManager', id);
        } else {
            contractRes = await network.query(networkObj, 'queryStudent', id);
        }

        let error = networkObj.error || contractRes.error;
        if (error) {
            let status = networkObj.status || contractRes.status;
            return apiResponse.createModelRes(status, error);
        }

        let { hashedPw, name, departments } = JSON.parse(contractRes);
        await authenticateUtil.certifyRefreshToken(refreshToken, hashedPw);
        let accessToken = authenticateUtil.generateAccessToken({ id, name, departments });

        return apiResponse.createModelRes(200, 'Success', { accessToken });
    } catch (err) {
        return apiResponse.createModelRes(400, 'This token is invalid');
    }
};
