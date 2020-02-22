import api from '@/services/api'

export default {
    async respond(reply) {
        reply = JSON.stringify(reply)
        return await api.instance().post('/replies', { reply })
    },

    async revise(reply) {
        reply = JSON.stringify(reply)
        return await api.instance().put('/replies', { reply })
    },

    async query(department, surveyCreatedAt) {
        return await api.instance().get(`/replies/${department}/${surveyCreatedAt}/${id}`)
    },

    // params: {startStudentID, endStudentID, pageSize, bookmarkStudentId}
    async queryAll(department, surveyCreatedAt, params = {}) {
        return await api.instance().get(`/replies/${department}/${surveyCreatedAt}`, { params })
    }
}