import api from '@/services/api';
// eslint-disable-next-line import/extensions
import Reply from '%/lib/Reply';

export default {
  makeReply(surveyKey, id, existReplyInfo, results) {
    const createdAt = existReplyInfo ? existReplyInfo.createdAt : Date.now();
    const reply = Reply.createInstance(surveyKey, id, createdAt);

    results.forEach((result, index) => {
      reply.addResult(index, result.answers);
    });
    return reply;
  },

  async respond(department, surveyCreatedAt, reply) {
    const replyJSON = JSON.stringify(reply);
    const params = { role: api.getData('role') };
    return await api
      .instance()
      .post(
        `/v1/fabric/state/departments/${department}/surveys/${surveyCreatedAt}/replies`,
        { reply: replyJSON },
        { params },
      );
  },

  async revise(department, surveyCreatedAt, reply) {
    const { studentID } = reply.replyInfo;
    const replyJSON = JSON.stringify(reply);
    const params = { role: api.getData('role') };
    return await api
      .instance()
      .put(
        `/v1/fabric/state/departments/${department}/surveys/${surveyCreatedAt}/replies/${studentID}`,
        { reply: replyJSON },
        { params },
      );
  },

  async query(department, surveyCreatedAt, id) {
    const params = { role: api.getData('role') };
    return await api
      .instance()
      .get(`/v1/fabric/state/departments/${department}/surveys/${surveyCreatedAt}/replies/${id}`, {
        params,
      });
  },

  // query: {startStudentID, endStudentID, pageSize, bookmarkStudentId}
  async queryAll(department, surveyCreatedAt, query = {}) {
    const params = { role: api.getData('role') };
    Object.assign(params, query);
    return await api
      .instance()
      .get(`/v1/fabric/state/departments/${department}/surveys/${surveyCreatedAt}/replies`, {
        params,
      });
  },
};
