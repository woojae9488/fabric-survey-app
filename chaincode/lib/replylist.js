
'use strict';

const StateList = require('../ledger-api/statelist.js');

const SurveyReply = require('./reply.js');

class ReplyList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.jnu.surveyreplylist');
        this.use(SurveyReply);
    }

    async addReply(reply) {
        return this.addState(reply);
    }

    async getReply(replyKey) {
        return this.getState(replyKey);
    }

    async getRepliesBySurveyKey(surveyKey) {
        return this.getStatesByPartialKey(surveyKey);
    }

    async getRepliesBySurveyKeyWithPagination(surveyKey, pageSize, replyBookmark) {
        return this.getStatesByPartialKeyWithPagination(surveyKey, pageSize, replyBookmark);
    }

    async getRepliesByRange(replyStart, replyEnd) {
        return this.getStatesByRange(replyStart, replyEnd);
    }

    async getRepliesByRangeWithPagination(replyStart, replyEnd, pageSize, replyBookmark) {
        return this.getStatesByRangeWithPagination(replyStart, replyEnd, pageSize, replyBookmark);
    }

    async updateReply(reply) {
        return this.updateState(reply);
    }

    async deleteReply(replyKey) {
        return this.deleteState(replyKey);
    }
}


module.exports = ReplyList;