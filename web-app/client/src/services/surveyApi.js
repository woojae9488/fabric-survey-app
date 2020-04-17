import api from '@/services/api';
import Survey from '../../../../chaincode/lib/Survey';

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
    const { department } = survey.surveyInfo;
    const surveyJSON = JSON.stringify(survey);
    const params = { role: api.getData('role') };
    return await api
      .instance()
      .post(
        `/v1/fabric/state/departments/${department}/surveys`,
        { survey: surveyJSON },
        { params },
      );
  },

  async update(survey) {
    const { department, createdAt } = survey.surveyInfo;
    const surveyJSON = JSON.stringify(survey);
    const params = { role: api.getData('role') };
    return await api
      .instance()
      .put(
        `/v1/fabric/state/departments/${department}/surveys/${createdAt}`,
        { survey: surveyJSON },
        { params },
      );
  },

  async remove(department, createdAt) {
    const params = { role: api.getData('role') };
    return await api
      .instance()
      .delete(`/v1/fabric/state/departments/${department}/surveys/${createdAt}`, { params });
  },

  async query(department, createdAt) {
    const params = { role: api.getData('role') };
    return await api
      .instance()
      .get(`/v1/fabric/state/departments/${department}/surveys/${createdAt}`, { params });
  },

  // params: {startCreatedAt, endCreatedAt, pageSize, bookmarkCreatedAt}
  async queryList(department, params = {}) {
    params.role = api.getData('role');
    return await api
      .instance()
      .get(`/v1/fabric/state/departments/${department}/surveys`, { params });
  },
};
