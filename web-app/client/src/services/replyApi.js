import api from '@/services/api'
import Reply from '../../../../chaincode/lib/Reply'

export default {
    makeReply(surveyKey, id, existReplyInfo, results) {
        const createdAt = Boolean(existCreatedAt) ? existReplyInfo.createdAt : Date.now();
        const reply = Reply.createInstance(
            surveyKey,
            id,
            createdAt
        );

        for (const index in results) {
            const result = results[index];
            reply.addResult(index, result.answers);
        }
        return reply;
    },

    async respond(reply) {
        reply = JSON.stringify(reply)
        return await api.instance().post('/replies', { reply })
    },

    async revise(reply) {
        reply = JSON.stringify(reply)
        return await api.instance().put('/replies', { reply })
    },

    async query(department, surveyCreatedAt, id) {
        return await api.instance().get(`/replies/${department}/${surveyCreatedAt}/${id}`)
    },

    // params: {startStudentID, endStudentID, pageSize, bookmarkStudentId}
    async queryAll(department, surveyCreatedAt, params = {}) {
        return await api.instance().get(`/replies/${department}/${surveyCreatedAt}`, { params })
    }
}