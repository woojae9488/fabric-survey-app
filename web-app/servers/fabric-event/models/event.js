const schedule = require('../fabric/schedule.js');
const apiResponse = require('../utils/apiResponse.js');

exports.queryEvents = async () => {
    const scheduleJobs = await schedule.getScheduleJobs();
    return apiResponse.createModelRes(200, 'Success', { scheduleJobs });
};
