import Api from '@/services/api'

export default {
    async respond(reply) {
        reply = JSON.stringify(reply);
        return await Api.instance().post('/replies', { reply });
    },

    async revise(reply) {
        reply = JSON.stringify(reply);
        return await Api.instance().put('/replies', { reply });
    },

    async query(department, surveyCreatedAt) {
        return await Api.instance().get(`/replies/${department}/${surveyCreatedAt}/${id}`);
    },

    // params: {startStudentID, endStudentID, pageSize, bookmarkStudentId}
    async queryAll(department, surveyCreatedAt, params) {
        return await Api.instance().get(`/replies/${department}/${surveyCreatedAt}`, { params });
    }
}