
'use strict';

const StateList = require('../ledger-api/StateList.js');

const Reply = require('./Reply.js');
const ReplyInfo = require('./ReplyInfo.js');
const ReplyResult = require('./ReplyResult.js');

class ReplyList extends StateList {

    constructor(ctx) {
        super(ctx);
        this.use(ReplyInfo);
        this.use(ReplyResult);
    }

    async addReply(reply) {
        const replyInfo = reply.getReplyInfo();
        const results = reply.getResults();

        await this.addState(replyInfo);

        for (const result of results) {
            await this.addState(result);
        }
    }

    async getReply(replyInfoKey) {
        const replyInfo = await this.getState(replyInfoKey);

        const replyKey = Reply.makeReplyKeyByInfoKey(replyInfoKey);
        const resultsKey = ReplyResult.makeKey([replyKey]);
        const results = await this.getStatesByPartialKey(resultsKey);

        return new Reply({ replyInfo, results });
    }

    async getReplyInfo(replyInfoKey) {
        return await this.getState(replyInfoKey);
    }

    async getRepliesBySurveyKey(surveyKey) {
        const replies = [];

        const replyInfosKey = ReplyInfo.makeKey([surveyKey]);
        const replyInfos = await this.getStatesByPartialKey(replyInfosKey);

        for (const replyInfo of replyInfos) {
            const replyKey = Reply.makeReplyKeyByInfoKey(replyInfo.getKey());
            const resultsKey = ReplyResult.makeKey([replyKey]);
            const results = await this.getStatesByPartialKey(resultsKey);
            replies.push(new Reply({ replyInfo, results }));
        }

        return replies;
    }

    async getRepliesByRange(replyInfoStart, replyInfoEnd) {
        const replies = [];

        const replyInfos = await this.getStatesByRange(replyInfoStart, replyInfoEnd);
        for (const replyInfo of replyInfos) {
            const replyKey = Reply.makeReplyKeyByInfoKey(replyInfo.getKey());
            const resultsKey = ReplyResult.makeKey([replyKey]);
            const results = await this.getStatesByPartialKey(resultsKey);
            replies.push(new Reply({ replyInfo, results }));
        }

        return replies;
    }

    async getRepliesByRangeWithPagination(replyInfoStart, replyInfoEnd, pageSize, replyBookmark) {
        const replies = [];

        const replyInfos = await this.getStatesByRangeWithPagination(replyInfoStart, replyInfoEnd, pageSize, replyBookmark);
        for (const replyInfo of replyInfos) {
            const replyKey = Reply.makeReplyKeyByInfoKey(replyInfo.getKey());
            const resultsKey = ReplyResult.makeKey([replyKey]);
            const results = await this.getStatesByPartialKey(resultsKey);
            replies.push(new Reply({ replyInfo, results }));
        }

        return replies;
    }

    async updateReply(reply) {
        const replyInfo = reply.getReplyInfo();
        const results = reply.getResults();
        const replyKey = reply.getReplyKey();

        await this.updateState(replyInfo);
        await this.deleteResults(replyKey);

        for (const result of results) {
            await this.addState(result);
        }
    }

    async deleteResults(replyKey) {
        const resultsKey = ReplyResult.makeKey([replyKey]);
        const results = await this.getStatesByPartialKey(resultsKey);

        for (const result of results) {
            await this.deleteState(result.getKey());
        }
    }

    static makeReplyBookmark(surveyKey, studentID) {
        const replyInfoKey = ReplyInfo.makeKey([surveyKey, studentID]);
        return StateList.makeBookmark(replyInfoKey);
    }
}

module.exports = ReplyList;