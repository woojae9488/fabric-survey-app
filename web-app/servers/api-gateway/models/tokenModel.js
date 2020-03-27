const api = require('../utils/api.js');
const authenticateUtil = require('../utils/authenticate.js');

exports.generateTokens = async (apiAddr, id, password) => {
    try {
        const apiResult = await api.instance(apiAddr).get('/user/certify', { id, password });

        const { hashedPw, name, departments } = apiResult.data;
        const accessToken = authenticateUtil.generateAccessToken({ id, name, departments });
        const refreshToken = authenticateUtil.generateRefreshToken({ id, hashedPw });

        return api.createModelRes(200, 'Success', { accessToken, refreshToken });
    } catch (err) {
        if (err.response) {
            const { status, data } = err.response;
            return api.createModelRes(status, data.message, data.data);
        }
        return api.createModelRes(500, err.toString());
    }
};

exports.certifyToken = async token => {
    try {
        const tokenRes = await authenticateUtil.certifyAccessToken(token);

        return api.createModelRes(200, 'Success', tokenRes);
    } catch (err) {
        return api.createModelRes(401, 'This token is invalid');
    }
};

exports.reissueAccessToken = async (apiAddr, refreshToken) => {
    try {
        const decodedToken = await authenticateUtil.decodedRefreshToken(refreshToken);
        const { id } = decodedToken;

        try {
            const apiResult = await api.instance(apiAddr).get('/user/query', { id });

            const { hashedPw, name, departments } = apiResult.data;
            await authenticateUtil.certifyRefreshToken(refreshToken, hashedPw);
            const accessToken = authenticateUtil.generateAccessToken({ id, name, departments });

            return api.createModelRes(200, 'Success', { accessToken });
        } catch (err) {
            if (err.response) {
                const { status, data } = err.response;
                return api.createModelRes(status, data.message, data.data);
            }
            return api.createModelRes(500, err.toString());
        }
    } catch (err) {
        return api.createModelRes(400, 'This token is invalid');
    }
};
