'use strict';

const config = require('../fabric/config.js').connection;
const connectionType = config.connectionType;
const authModel = require('../models/auth.js');
const apiResponse = require('../utils/apiResponse.js');

exports.signup = async (req, res, next) => {
    const { id, password, name, departments } = req.body;

    if (!id || !password || !name || !departments) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (name === 'manager') {
        modelRes = await authModel.signup(connectionType.MANAGER, { id, password, departments });
    } else {
        modelRes = await authModel.signup(connectionType.STUDENT, { id, password, name, departments });
    }

    return apiResponse.send(res, modelRes);
};

exports.signin = async (req, res, next) => {
    const { id, password, name } = req.body;

    if (!id || !password) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (name === 'manager') {
        modelRes = await authModel.signin(connectionType.MANAGER, { id, password });
    } else {
        modelRes = await authModel.signin(connectionType.STUDENT, { id, password });
    }

    return apiResponse.send(res, modelRes);
};

exports.signout = async (req, res, next) => {
    const { id, password, name } = req.body;

    if (!id || !password) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (name === 'manager') {
        modelRes = await authModel.signout(connectionType.MANAGER, { id, password });
    } else {
        modelRes = await authModel.signout(connectionType.STUDENT, { id, password });
    }

    return apiResponse.send(res, modelRes);
};

exports.certifyUser = async (req, res, next) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return apiResponse.badRequest(res);
    }

    let modelRes = await authModel.certifyUser(token);
    return apiResponse.send(res, modelRes);
}

exports.reissueAccessToken = async (req, res, next) => {
    const refreshToken = req.headers['x-refresh-token'];
    const { name } = req.body;

    if (!refreshToken) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (name === 'manager') {
        modelRes = await authModel.reissueAccessToken(connectionType.MANAGER, refreshToken);
    } else {
        modelRes = await authModel.reissueAccessToken(connectionType.STUDENT, refreshToken);
    }

    return apiResponse.send(res, modelRes);
}
