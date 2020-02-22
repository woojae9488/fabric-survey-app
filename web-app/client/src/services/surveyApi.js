import api from '@/services/api'

export default {
    async register(survey) {
        survey = JSON.stringify(survey)
        return await api.instance().post('/surveys', { survey })
    },

    async update(survey) {
        survey = JSON.stringify(survey)
        return await api.instance().put('/surveys', { survey })
    },

    async remove(department, createdAt) {
        return await api.instance().delete(`/surveys/${department}/${createdAt}`)
    },

    async query(department, createdAt) {
        return await api.instance().get(`/surveys/${department}/${createdAt}`)
    },

    // params: {startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt}
    async queryList(department, params = {}) {
        return await api.instance().get(`/surveys/${department}`, { params })
    }
}