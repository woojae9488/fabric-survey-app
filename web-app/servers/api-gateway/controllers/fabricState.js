const api = require('../utils/api.js');

exports.addDepartment = async (req, res) => {
    try {
        const apiResult = await api.instance(req.apiAddr).post('/departments', req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.queryDepartments = async (req, res) => {
    try {
        const apiResult = await api.instance(req.apiAddr).get('/departments', { data: req.body });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.queryDepartment = async (req, res) => {
    const { dName } = req.params;

    try {
        const apiResult = await api.instance(req.apiAddr).get(`/departments/${dName}`, { data: req.body });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.updateDepartment = async (req, res) => {
    const { dName } = req.params;

    try {
        const apiResult = await api.instance(req.apiAddr).put(`/departments/${dName}`, req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.deleteDepartment = async (req, res) => {
    const { dName } = req.params;

    try {
        const apiResult = await api.instance(req.apiAddr).delete(`/departments/${dName}`, { data: req.body });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.registerSurvey = async (req, res) => {
    try {
        const apiResult = await api.instance(req.apiAddr).post('/surveys', req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.querySurveys = async (req, res) => {
    const { dName } = req.params;

    try {
        const apiResult = await api
            .instance(req.apiAddr)
            .get(`/surveys/${dName}`, { data: req.body, params: req.query });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.querySurvey = async (req, res) => {
    const { dName, sCreatedAt } = req.params;

    try {
        const apiResult = await api.instance(req.apiAddr).get(`/surveys/${dName}/${sCreatedAt}`, { data: req.body });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.updateSurvey = async (req, res) => {
    const { dName, sCreatedAt } = req.params;

    try {
        const apiResult = await api.instance(req.apiAddr).put(`/surveys/${dName}/${sCreatedAt}`, req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.removeSurvey = async (req, res) => {
    const { dName, sCreatedAt } = req.params;

    try {
        const apiResult = await api.instance(req.apiAddr).delete(`/surveys/${dName}/${sCreatedAt}`, { data: req.body });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.respondReply = async (req, res) => {
    try {
        const apiResult = await api.instance(req.apiAddr).post('/replies', req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.queryReplies = async (req, res) => {
    const { dName, sCreatedAt } = req.params;

    try {
        const apiResult = await api
            .instance(req.apiAddr)
            .get(`/replies/${dName}/${sCreatedAt}`, { data: req.body, params: req.query });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.queryReply = async (req, res) => {
    const { dName, sCreatedAt, rStudentId } = req.params;

    try {
        const apiResult = await api
            .instance(req.apiAddr)
            .get(`/replies/${dName}/${sCreatedAt}/${rStudentId}`, { data: req.body });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.reviseReply = async (req, res) => {
    const { dName, sCreatedAt, rStudentId } = req.params;

    try {
        const apiResult = await api
            .instance(req.apiAddr)
            .put(`/replies/${dName}/${sCreatedAt}/${rStudentId}`, req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};
