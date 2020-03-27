const api = require('../utils/api.js');

exports.queryEvents = async (_req, res) => {
    try {
        const apiResult = await api.instance(process.env.ADDR_FABRIC_EVENT).get('/events');
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};
