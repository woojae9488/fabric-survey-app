import api from '@/services/api';
import Reply from '../../../../chaincode/lib/Reply';

export default {
  makeReply(surveyKey, id, existReplyInfo, results) {
    const createdAt = existReplyInfo ? existReplyInfo.createdAt : Date.now();
    const reply = Reply.createInstance(surveyKey, id, createdAt);

    results.forEach((result, index) => {
      reply.addResult(index, result.answers);
    });
    return reply;
  },

  async respond(reply) {
    const replyJSON = JSON.stringify(reply);
    return await api.instance().post('/replies', { reply: replyJSON });
  },

  async revise(reply) {
    const replyJSON = JSON.stringify(reply);
    return await api.instance().put('/replies', { reply: replyJSON });
  },

  async query(department, surveyCreatedAt, id) {
    return await api.instance().get(`/replies/${department}/${surveyCreatedAt}/${id}`);
  },

  // params: {startStudentID, endStudentID, pageSize, bookmarkStudentId}
  async queryAll(department, surveyCreatedAt, params = {}) {
    return await api.instance().get(`/replies/${department}/${surveyCreatedAt}`, { params });
  },
};
