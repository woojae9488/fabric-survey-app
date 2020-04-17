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
    req.query.id = req.body.id;

    try {
        const apiResult = await api.instance(req.apiAddr).get('/departments', { params: req.query });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.queryDepartment = async (req, res) => {
    const { dName } = req.params;
    req.query.id = req.body.id;
    const encodedURL = encodeURI(`/departments/${dName}`);

    try {
        const apiResult = await api.instance(req.apiAddr).get(encodedURL, { params: req.query });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.updateDepartment = async (req, res) => {
    const { dName } = req.params;
    const encodedURL = encodeURI(`/departments/${dName}`);

    try {
        const apiResult = await api.instance(req.apiAddr).put(encodedURL, req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.deleteDepartment = async (req, res) => {
    const { dName } = req.params;
    req.query.id = req.body.id;
    const encodedURL = encodeURI(`/departments/${dName}`);

    try {
        const apiResult = await api.instance(req.apiAddr).delete(encodedURL, { params: req.query });
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
    req.query.id = req.body.id;
    const encodedURL = encodeURI(`/surveys/${dName}`);

    try {
        const apiResult = await api.instance(req.apiAddr).get(encodedURL, { params: req.query });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.querySurvey = async (req, res) => {
    const { dName, sCreatedAt } = req.params;
    req.query.id = req.body.id;
    const encodedURL = encodeURI(`/surveys/${dName}/${sCreatedAt}`);

    try {
        const apiResult = await api.instance(req.apiAddr).get(encodedURL, { params: req.query });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.updateSurvey = async (req, res) => {
    const { dName, sCreatedAt } = req.params;
    const encodedURL = encodeURI(`/surveys/${dName}/${sCreatedAt}`);

    try {
        const apiResult = await api.instance(req.apiAddr).put(encodedURL, req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.removeSurvey = async (req, res) => {
    const { dName, sCreatedAt } = req.params;
    req.query.id = req.body.id;
    const encodedURL = encodeURI(`/surveys/${dName}/${sCreatedAt}`);

    try {
        const apiResult = await api.instance(req.apiAddr).delete(encodedURL, { params: req.query });
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
    req.query.id = req.body.id;
    const encodedURL = encodeURI(`/replies/${dName}/${sCreatedAt}`);

    try {
        const apiResult = await api.instance(req.apiAddr).get(encodedURL, { params: req.query });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.queryReply = async (req, res) => {
    const { dName, sCreatedAt, rStudentId } = req.params;
    req.query.id = req.body.id;
    const encodedURL = encodeURI(`/replies/${dName}/${sCreatedAt}/${rStudentId}`);

    try {
        const apiResult = await api.instance(req.apiAddr).get(encodedURL, { params: req.query });
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};

exports.reviseReply = async (req, res) => {
    const { dName, sCreatedAt, rStudentId } = req.params;
    const encodedURL = encodeURI(`/replies/${dName}/${sCreatedAt}/${rStudentId}`);

    try {
        const apiResult = await api.instance(req.apiAddr).put(encodedURL, req.body);
        return api.send(res, apiResult);
    } catch (err) {
        return api.error(res, err);
    }
};
