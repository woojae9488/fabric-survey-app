const eventModel = require('../models/event.js');
const apiResponse = require('../utils/apiResponse.js');

exports.queryEvents = async (_req, res) => {
    const modelRes = await eventModel.queryEvents();
    return apiResponse.send(res, modelRes);
};
