const departmentModel = require('../models/department.js');
const apiResponse = require('../utils/apiResponse.js');

exports.addDepartment = async (req, res) => {
    const { id, dName, dParent } = req.body;

    if (!dName || !dParent) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await departmentModel.addDepartment({ id, dName, dParent });
    return apiResponse.send(res, modelRes);
};

exports.queryDepartments = async (req, res) => {
    const { id } = req.body;

    const modelRes = await departmentModel.queryDepartments({ id });
    return apiResponse.send(res, modelRes);
};

exports.queryDepartment = async (req, res) => {
    const { id } = req.body;
    const { dName } = req.params;

    const modelRes = await departmentModel.queryDepartment({ id, dName });
    return apiResponse.send(res, modelRes);
};

exports.updateDepartment = async (req, res) => {
    const { id, dNewParent } = req.body;
    const { dName } = req.params;

    if (!dNewParent) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await departmentModel.updateDepartment({ id, dName, dNewParent });
    return apiResponse.send(res, modelRes);
};

exports.deleteDepartment = async (req, res) => {
    const { id } = req.body;
    const { dName } = req.params;

    const modelRes = await departmentModel.deleteDepartment({ id, dName });
    return apiResponse.send(res, modelRes);
};
