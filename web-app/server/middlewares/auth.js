'use strict';

const authenticateUtil = require('../utils/authenticate');

module.exports = async (req, res, next) => {
    const accessToken = req.headers['x-access-token'];

    if (!accessToken) {
        return res.status(401).json({
            message: 'Required access token',
            data: {}
        });
        // redirect to signup or signin page
    }

    try {
        let result = await authenticateUtil.certifyAccessToken(accessToken);
        req.body.id = result.id;
        req.body.name = result.name;
        req.body.departments = result.departments;
        next();
    } catch (err) {
        return res.status(401).json({
            message: err,
            data: {}
        });
    }
};
