const State = require('../ledger-api/State.js');
const ReplyInfo = require('./ReplyInfo.js');
const ReplyResult = require('./ReplyResult.js');

class Reply {
    constructor(obj) {
        const replyInfoKey = obj.replyInfo.getKey();
        this.replyKey = Reply.makeReplyKeyByInfoKey(replyInfoKey);
        Object.assign(this, obj);
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

    static fromString(objStr) {
        const json = JSON.parse(objStr);
        const replyInfo = new ReplyInfo(json.replyInfo);

        const results = [];
        const jsonResults = json.results;
        jsonResults.forEach(jsonResult => {
            results.push(new ReplyResult(jsonResult));
        });

        return new Reply({ replyInfo, results });
    }

    toString() {
        return JSON.stringify(this);
    }

    static makeReplyKey(surveyKey, studentID) {
        return [surveyKey, studentID].join('_');
    }

    static makeReplyKeyByInfoKey(replyInfoKey) {
        const keyParts = State.splitKey(replyInfoKey);
        keyParts.shift();
        return keyParts.join('_');
    }

    static makeInfoKeyByReplyKey(replyKey) {
        const keyParts = replyKey.split('_');
        return ReplyInfo.makeKey(keyParts);
    }

    static createInstance(surveyKey, studentID, createdAt) {
        const replyInfo = ReplyInfo.createInstance(surveyKey, studentID, createdAt);
        const results = [];
        return new Reply({ replyInfo, results });
    }

    addResult(resultNum, answers) {
        const result = ReplyResult.createInstance(this.replyKey, resultNum, answers);
        this.results.push(result);
    }
}

module.exports = Reply;
