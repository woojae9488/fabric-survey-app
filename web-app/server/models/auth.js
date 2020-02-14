'use strict';

const network = require('../fabric/network.js');
const config = require('../fabric/config.js').connection;
const connectionType = config.connectionType;
const authenticateUtil = require('../utils/authenticate.js');

exports.signup = async (connType, information) => {
    const { id, password, name, departments } = information;
    let departmentsJSON = JSON.stringify(departments);

    let walletRes, networkObj, contractRes;
    if (connType === connectionType.MANAGER) {
        walletRes = await network.registerUser(connectionType.MANAGER, id);
        networkObj = await network.connect(connectionType.MANAGER, id);
        contractRes = await network.invoke(networkObj, 'registerManager', id, password, departmentsJSON);
    } else {
        walletRes = await network.registerUser(connectionType.STUDENT, id);
        networkObj = await network.connect(connectionType.STUDENT, id);
        contractRes = await network.invoke(networkObj, 'registerStudent', id, password, name, departmentsJSON);
    }

    let error = walletRes.error || networkObj.error || contractRes.error;
    let status = walletRes.status || networkObj.status || contractRes.status;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    return apiResponse.createModelRes(200, 'Success');
};

exports.signin = async (connType, information) => {
    const { id, password } = information;

    let networkObj, contractRes;
    if (connType === connectionType.MANAGER) {
        networkObj = await network.connect(connectionType.MANAGER, id);
        contractRes = await network.query(networkObj, 'certifyManager', id, password);
    } else {
        networkObj = await network.connect(connectionType.STUDENT, id);
        contractRes = await network.query(networkObj, 'certifyStudent', id, password);
    }

    let error = networkObj.error || contractRes.error;
    let status = networkObj.status || contractRes.status;
    if (error) {
        return apiResponse.createModelRes(status, error);
    }

    let { hashedPw, name, departments } = JSON.parse(contractRes);
    let accessToken = authenticateUtil.generateAccessToken({ id, name, departments });
    let refreshToken = authenticateUtil.generateRefreshToken({ id, hashedPw });

    return apiResponse.createModelRes(200, 'Success', { accessToken, refreshToken });
};

exports.signout = async (connType, information) => {
    const { id, password } = information;

    let networkObj, contractRes;
    if (connType === connectionType.MANAGER) {
        networkObj = await network.connect(connectionType.MANAGER, id);
        contractRes = await network.invoke(networkObj, 'deleteManager', id, password);
    } else {
        networkObj = await network.connect(connectionType.STUDENT, id);
        contractRes = await network.invoke(networkObj, 'deleteStudent', id, password);
    }

    let error = networkObj.error || contractRes.error;
    let status = networkObj.status || contractRes.status;
    if (error) {
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

        let networkObj, contractRes;
        if (connType === connectionType.MANAGER) {
            networkObj = await network.connect(connectionType.MANAGER, id);
            contractRes = await network.query(networkObj, 'queryManager', id);
        } else {
            networkObj = await network.connect(connectionType.STUDENT, id);
            contractRes = await network.query(networkObj, 'queryStudent', id);
        }

        let error = networkObj.error || contractRes.error;
        let status = networkObj.status || contractRes.status;
        if (error) {
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
