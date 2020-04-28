import api from '@/services/api';
// eslint-disable-next-line import/extensions
import Survey from '%/lib/Survey';

export default {
  makeSurvey(id, surveyInfo, questions) {
    const createdAt = surveyInfo.createdAt || Date.now();
    const survey = Survey.createInstance(
      surveyInfo.department,
      createdAt,
      id,
      surveyInfo.title,
      surveyInfo.start,
      surveyInfo.finish,
    );

    questions.forEach((question, index) => {
      survey.addQuestion(index, question.title, question.type, question.contents);
    });
    return survey;
  },

  async register(survey) {
    const surveyJSON = JSON.stringify(survey);
    return await api.instance().post('/surveys', { survey: surveyJSON });
  },

  async update(survey) {
    const surveyJSON = JSON.stringify(survey);
    return await api.instance().put('/surveys', { survey: surveyJSON });
  },

  async remove(department, createdAt) {
    return await api.instance().delete(`/surveys/${department}/${createdAt}`);
  },

  async query(department, createdAt) {
    return await api.instance().get(`/surveys/${department}/${createdAt}`);
  },

  // params: {startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt}
  async queryList(department, params = {}) {
    return await api.instance().get(`/surveys/${department}`, { params });
  },
};
