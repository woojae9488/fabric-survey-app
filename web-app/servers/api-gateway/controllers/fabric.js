const api = require('../utils/api.js');

exports.pass = async (req, res) => {
    try {
        const apiResult = await api.instance(process.env.ADDR_FABRIC_API_GATEWAY).request({
            url: req.url,
            method: req.method,
            headers: {
                'x-access-token': req.headers['x-access-token'],
                'x-refresh-token': req.headers['x-refresh-token'],
            },
            data: req.body,
        });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};
