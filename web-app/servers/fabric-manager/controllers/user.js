const userModel = require('../models/user.js');
const apiResponse = require('../utils/apiResponse.js');

exports.registerUser = async (req, res) => {
    const { id, password, departments } = req.body;

    if (!id || !password || !departments) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await userModel.registerUser({ id, password, departments });
    return apiResponse.send(res, modelRes);
};

exports.checkExistence = async (req, res) => {
    const { uid } = req.params;

    const modelRes = await userModel.checkExistence({ uid });
    return apiResponse.send(res, modelRes);
};

exports.queryUser = async (req, res) => {
    const { uid } = req.params;

    const modelRes = await userModel.queryUser({ id: uid });
    return apiResponse.send(res, modelRes);
};

exports.certifyUser = async (req, res) => {
    const { password } = req.body;
    const { uid } = req.params;

    if (!password) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await userModel.certifyUser({ id: uid, password });
    return apiResponse.send(res, modelRes);
};

exports.updateUser = async (req, res) => {
    const { id, newPassword, newDepartments } = req.body;
    const { uid } = req.params;

    if (!newPassword || !newDepartments || id !== uid) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await userModel.updateUser({ id, newPassword, newDepartments });
    return apiResponse.send(res, modelRes);
};

exports.deleteUser = async (req, res) => {
    const { id, password } = req.body;
    const { uid } = req.params;

    if (!password || id !== uid) {
        return apiResponse.badRequest(res);
    }

    const modelRes = await userModel.deleteUser({ id, password });
    return apiResponse.send(res, modelRes);
};
