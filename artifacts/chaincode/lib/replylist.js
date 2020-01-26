
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

    async getRepliesBySurveyKey(surveyKey){
        return this.getStatesByPartialKey(surveyKey);
    }

    async updateReply(reply) {
        return this.updateState(reply);
    }

    async deleteReply(replyKey) {
        return this.deleteState(replyKey);
    }
}


module.exports = ReplyList;