const departmentModel = require('../models/department.js');
const apiResponse = require('../utils/apiResponse.js');

exports.queryDepartments = async (req, res) => {
    const { id } = req.query;

    const modelRes = await departmentModel.queryDepartments({ id });
    return apiResponse.send(res, modelRes);
};

exports.queryDepartment = async (req, res) => {
    const { id } = req.query;
    const { dName } = req.params;

    const modelRes = await departmentModel.queryDepartment({ id, dName });
    return apiResponse.send(res, modelRes);
};
