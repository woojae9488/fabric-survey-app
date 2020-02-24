import api from '@/services/api'
import Survey from '../../../../chaincode/lib/Survey'

export default {
    makeSurvey(id,surveyInfo, questions) {
        const survey = Survey.createInstance(
            surveyInfo.department,
            surveyInfo.createdAt,
            id,
            surveyInfo.title,
            surveyInfo.startDate,
            surveyInfo.finishDate
        );

        for (const index in questions) {
            const question = questions[index];
            survey.addQuestion(index + 1, question.title, question.type, question.contents);
        }
        return survey;
    },

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