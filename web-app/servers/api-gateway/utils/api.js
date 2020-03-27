const axios = require('axios');

exports.instance = url => {
    return axios.create({
        baseURL: url,
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
    });
};

exports.send = (res, apiResult) => {
    return res.status(apiResult.status).json(apiResult.data);
};

exports.error = (res, apiError) => {
    if (apiError.response) {
        return res.status(apiError.response.status).json(apiError.response.data);
    }
    return res.status(500).json({
        message: apiError.toString(),
        data: {},
    });
};

exports.badRequest = res => {
    return res.status(400).json({
        message: 'This is not valid request',
        data: {},
    });
};

exports.unauthorized = (res, msg) => {
    return res.status(401).json({
        message: msg,
        data: {},
    });
};

exports.notFound = res => {
    return res.status(404).json({
        message: 'API not found',
        data: {},
    });
};

exports.createModelRes = (status, message, data = {}) => {
    return { status, message, data };
};

exports.sendModelRes = (res, modelRes) => {
    return res.status(modelRes.status).json({
        message: modelRes.message,
        data: modelRes.data,
    });
};
