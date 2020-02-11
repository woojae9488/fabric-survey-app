
'use strict';

const StateList = require('../ledger-api/statelist.js');

const Reply = require('./reply.js');
const ReplyInfo = require('./replyinfo.js');
const ReplyResult = require('./replyresult.js');

class ReplyList extends StateList {

    constructor(ctx) {
        super(ctx);
        this.use(ReplyInfo);
        this.use(ReplyResult);
    }

    async addReply(reply) {
        let replyInfo = reply.getReplyInfo();
        let results = reply.getResults();

        await this.addState(replyInfo);
        for (let i = 0; i < results.length; i++) {
            await this.addState(results[i]);
        }
    }

    async getReply(replyInfoKey) {
        let replyInfo = await this.getState(replyInfoKey);

        let replyKey = Reply.makeReplyKeyByInfoKey(replyInfoKey);
        let resultsKey = ReplyResult.makeKey([replyKey]);
        let results = await this.getStatesByPartialKey(resultsKey);

        return new Reply({ replyInfo, results });
    }

    async getReplyInfo(replyInfoKey) {
        return await this.getState(replyInfoKey);
    }

    async getRepliesBySurveyKey(surveyKey) {
        let replies = [];

        let replyInfosKey = ReplyInfo.makeKey([surveyKey]);
        let replyInfos = await this.getStatesByPartialKey(replyInfosKey);

        for (let i = 0; i < replyInfos.length; i++) {
            let replyInfo = replyInfos[i];
            let replyKey = Reply.makeReplyKeyByInfoKey(replyInfo.getKey());
            let resultsKey = ReplyResult.makeKey([replyKey]);
            let results = await this.getStatesByPartialKey(resultsKey);
            replies.push(new Reply({ replyInfo, results }));
        }

        return replies;
    }

    async getRepliesByRange(replyInfoStart, replyInfoEnd) {
        let replies = [];

        let replyInfos = await this.getStatesByRange(replyInfoStart, replyInfoEnd);
        for (let i = 0; i < replyInfos.length; i++) {
            let replyInfo = replyInfos[i];
            let replyKey = Reply.makeReplyKeyByInfoKey(replyInfo.getKey());
            let resultsKey = ReplyResult.makeKey([replyKey]);
            let results = await this.getStatesByPartialKey(resultsKey);
            replies.push(new Reply({ replyInfo, results }));
        }

        return replies;
    }

    async getRepliesByRangeWithPagination(replyInfoStart, replyInfoEnd, pageSize, replyBookmark) {
        let replies = [];

        let replyInfos = await this.getStatesByRangeWithPagination(replyInfoStart, replyInfoEnd, pageSize, replyBookmark);
        for (let i = 0; i < replyInfos.length; i++) {
            let replyInfo = replyInfos[i];
            let replyKey = Reply.makeReplyKeyByInfoKey(replyInfo.getKey());
            let resultsKey = ReplyResult.makeKey([replyKey]);
            let results = await this.getStatesByPartialKey(resultsKey);
            replies.push(new Reply({ replyInfo, results }));
        }

        return replies;
    }

    async updateReply(reply) {
        let replyInfo = reply.getReplyInfo();
        let results = reply.getResults();
        let replyKey = reply.getReplyKey();

        await this.updateState(replyInfo);
        await this.deleteResults(replyKey);
        for (let i = 0; i < results.length; i++) {
            await this.addState(results[i]);
        }
    }

    async deleteResults(replyKey) {
        let resultsKey = ReplyResult.makeKey([replyKey]);
        let results = await this.getStatesByPartialKey(resultsKey);

        for (let i = 0; i < results.length; i++) {
            await this.deleteState(results[i].getKey());
        }
    }

    static makeReplyBookmark(surveyKey, studentID) {
        let replyInfoKey = ReplyInfo.makeKey([surveyKey, studentID]);
        return StateList.makeBookmark(replyInfoKey);
    }
}

module.exports = ReplyList;