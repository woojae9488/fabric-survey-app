const api = require('../utils/api.js');
const tokenModel = require('../models/tokenModel.js');

exports.signup = async (req, res) => {
    const { role } = req.query;

    if (role === 'manager') {
        const token = req.headers['x-access-token'];
        const tokenRes = await tokenModel.certifyToken(token);
        if (tokenRes.status !== 200 || tokenRes.data.name !== 'manager') {
            return api.unauthorized(res);
        }
    }

    try {
        const apiResult = await api.instance(req.apiAddr).post('/users', req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.checkExistence = async (req, res) => {
    const { uid } = req.params;

    try {
        const apiResult = await api.instance(req.apiAddr).get(`/users/${uid}/check`);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.changeInfo = async (req, res) => {
    const { uid } = req.params;

    try {
        const apiResult = await api.instance(req.apiAddr).put(`/users/${uid}`, req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.signout = async (req, res) => {
    const { uid } = req.params;
    req.query.id = req.body.id;

    try {
        const apiResult = await api.instance(req.apiAddr).delete(`/users/${uid}`, { params: req.query });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.signin = async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return api.badRequest(res);
    }

    const modelRes = await tokenModel.generateTokens(req.apiAddr, id, password);
    return api.sendModelRes(res, modelRes);
};

exports.certifyUser = async (req, res) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return api.badRequest(res);
    }

    const modelRes = await tokenModel.certifyToken(token);
    return api.sendModelRes(res, modelRes);
};

exports.reissueAccessToken = async (req, res) => {
    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken) {
        return api.badRequest(res);
    }

    const modelRes = await tokenModel.reissueAccessToken(req.apiAddr, refreshToken);
    return api.sendModelRes(res, modelRes);
};
