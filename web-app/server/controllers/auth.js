'use strict';

const authModel = require('../models/auth.js');
const apiResponse = require('../utils/apiResponse.js');

exports.signup = async (req, res, _next) => {
    const { id, password, name, departments } = req.body;
    const { role } = req.params;

    if (!id || !password || !name || !departments) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (role === 'manager') {
        const token = req.headers['x-access-token'];
        const tokenRes = await authModel.certifyUser(token);
        if (tokenRes.status !== 200 || tokenRes.data.name !== 'manager') {
            return apiResponse.unauthorized(res);
        }

        modelRes = await authModel.signup(true, { id, password, departments });
    } else if (role === 'student') {
        modelRes = await authModel.signup(false, { id, password, name, departments });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.checkExistence = async (req, res, _next) => {
    const { role, uid } = req.params;

    if (!uid) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (role === 'manager') {
        modelRes = await authModel.checkExistence(true, { uid });
    } else if (role === 'student') {
        modelRes = await authModel.checkExistence(false, { uid });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.signin = async (req, res, _next) => {
    const { id, password } = req.body;
    const { role } = req.params;

    if (!id || !password) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (role === 'manager') {
        modelRes = await authModel.signin(true, { id, password });
    } else if (role === 'student') {
        modelRes = await authModel.signin(false, { id, password });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.changeInfo = async (req, res, _next) => {
    const { id, newPassword, newName, newDepartments } = req.body;
    const { role, uid } = req.params;

    if (!newPassword || !newName || !newDepartments || id !== uid) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (role === 'manager') {
        modelRes = await authModel.changeInfo(true, { id, newPassword, newDepartments });
    } else if (role === 'student') {
        modelRes = await authModel.changeInfo(false, { id, newPassword, newName, newDepartments });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.signout = async (req, res, _next) => {
    const { id, password } = req.body;
    const { role, uid } = req.params;

    if (!password || id !== uid) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (role === 'manager') {
        modelRes = await authModel.signout(true, { id, password });
    } else if (role === 'student') {
        modelRes = await authModel.signout(false, { id, password });
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
};

exports.certifyUser = async (req, res, _next) => {
    const token = req.headers['x-access-token'];
    const { role } = req.params;

    if (!token || !(role === 'manager' || role === 'student')) {
        return apiResponse.badRequest(res);
    }

    let modelRes = await authModel.certifyUser(token);
    return apiResponse.send(res, modelRes);
}

exports.reissueAccessToken = async (req, res, _next) => {
    const refreshToken = req.headers['x-refresh-token'];
    const { role } = req.params;

    if (!refreshToken) {
        return apiResponse.badRequest(res);
    }

    let modelRes;
    if (role === 'manager') {
        modelRes = await authModel.reissueAccessToken(true, refreshToken);
    } else if (role === 'student') {
        modelRes = await authModel.reissueAccessToken(false, refreshToken);
    } else {
        return apiResponse.badRequest(res);
    }

    return apiResponse.send(res, modelRes);
}
