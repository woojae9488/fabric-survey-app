
'use strict';

const StateList = require('../ledger-api/statelist.js');

const SurveyReplyResult = require('./result.js');

class ResultList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.jnu.surveyreplyresultlist');
        this.use(SurveyReplyResult);
    }

    async addResult(result) {
        return this.addState(result);
    }

    async getResult(resultKey) {
        return this.getState(resultKey);
    }

    async getResultsByReplyKey(replyKey) {
        return this.getStatesByPartialKey(replyKey);
    }

    async getResultsByReplyKeyWithPagination(replyKey, pageSize, resultBookmark) {
        return this.getStatesByPartialKeyWithPagination(replyKey, pageSize, resultBookmark);
    }

    async getResultsByRange(resultStart, resultEnd) {
        return this.getStatesByRange(resultStart, resultEnd);
    }

    async getResultsByRangeWithPagination(resultStart, resultEnd, pageSize, resultBookmark) {
        return this.getStatesByRangeWithPagination(resultStart, resultEnd, pageSize, resultBookmark);
    }

    async updateResult(result) {
        return this.updateState(result);
    }

    async deleteResult(resultKey) {
        return this.deleteState(resultKey);
    }
}


module.exports = ResultList;