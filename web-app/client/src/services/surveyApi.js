import Api from '@/services/api'

export default {
    async register(survey) {
        survey = JSON.stringify(survey)
        return await Api.instance().post('/surveys', { survey })
    },

    async update(survey) {
        survey = JSON.stringify(survey)
        return await Api.instance().put('/surveys', { survey })
    },

    async remove(department, createdAt) {
        return await Api.instance().delete(`/surveys/${department}/${createdAt}`)
    },

    async query(department, createdAt) {
        return await Api.instance().get(`/surveys/${department}/${createdAt}`)
    },

    // params: {startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt}
    async queryList(department, params = {}) {
        return await Api.instance().get(`/surveys/${department}`, { params })
    }
}