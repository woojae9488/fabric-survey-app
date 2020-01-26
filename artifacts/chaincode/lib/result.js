
'use strict';

const State = require('../ledger-api/state.js');

class SurveyReplyResult extends State {

    constructor(obj) {
        super(SurveyReplyResult.getClass(), [obj.replyKey, obj.resultNum]);
        Object.assign(this, obj);
    }

    static fromBuffer(buffer) {
        return SurveyReplyResult.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, SurveyReplyResult);
    }

    static createInstance(replyKey, resultNum, answers) {
        return new SurveyReplyResult({ replyKey, resultNum, answers });
    }

    static getClass() {
        return 'org.jnu.surveyreplyresult';
    }
}

module.exports = SurveyReplyResult;
