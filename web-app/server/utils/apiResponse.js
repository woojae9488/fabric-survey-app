'use strict';

exports.createModelRes = (status, message, data = {}) => {
    return { status, message, data };
}

exports.send = (res, modelRes) => {
    return res.status(modelRes.status).json({
        message: modelRes.message,
        data: modelRes.data
    });
}

exports.badRequest = (res) => {
    return res.status(400).json({
        message: 'This is not valid request',
        data: {}
    });
};

exports.notFound = (res) => {
    return res.status(404).json({
        message: 'API not found',
        data: {}
    });
};
