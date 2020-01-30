
'use strict';

const State = require('../ledger-api/state.js');
const ReplyInfo = require('./replyinfo.js');
const ReplyResult = require('./replyresult.js');

class Reply {

    constructor(obj) {
        Object.assign(this, obj);
        let replyInfoKey = this.replyInfo.getKey();
        this.replyKey = Reply.makeReplyKeyByInfoKey(replyInfoKey);
    }

    getReplyKey() {
        return this.replyKey;
    }

    setReplyInfo(newReplyInfo) {
        this.replyInfo = newReplyInfo;
    }

    getReplyInfo() {
        return this.replyInfo;
    }

    setResults(newResults) {
        this.results = newResults;
    }

    getResults() {
        return this.results;
    }

    static fromBuffer(buffer) {
        let json = JSON.parse(buffer.toString());
        let replyInfo = new ReplyInfo(json.replyInfo);

        let results = [];
        let jsonResults = json.results;
        for (let i = 0; i < jsonResults.length; i++) {
            results.push(new ReplyResult(jsonResults[i]));
        }

        return new Reply({ replyInfo, results });
    }

    toString() {
        return Buffer.from(JSON.stringify(this));
    }

    static makeReplyKey(surveyKey, studentID) {
        return [surveyKey, studentID].join('.');
    }

    static makeReplyKeyByInfoKey(replyInfoKey) {
        let keyParts = State.splitKey(replyInfoKey);
        keyParts.shift();
        return keyParts.join('.');
    }

    static makeInfoKeyByReplyKey(replyKey) {
        let keyParts = replyKey.split('.');
        return ReplyInfo.makeKey(keyParts);
    }

    static createInstance(surveyKey, studentID, createdAt) {
        let replyInfo = ReplyInfo.createInstance(surveyKey, studentID, createdAt);
        let results = [];
        return new Reply({ replyInfo, results });
    }

    addResults(resultNum, answers) {
        let result = ReplyResult.createInstance(this.replyKey, resultNum, answers);
        this.results.push(result);
    }

}

module.exports = Reply;
