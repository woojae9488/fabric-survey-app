const api = require('../utils/api.js');

module.exports = async (req, res, next) => {
    const { role } = req.query;

    if (!role || !(role === 'manager' || role === 'student')) {
        return api.badRequest(res);
    }

    if (role === 'manager') {
        req.apiAddr = process.env.ADDR_FABRIC_MANAGER;
    } else if (role === 'student') {
        req.apiAddr = process.env.ADDR_FABRIC_STUDENT;
    }

    return next();
};
