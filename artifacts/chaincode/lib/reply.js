
'use strict';

const State = require('../ledger-api/state.js');

class SurveyReply extends State {

    constructor(obj) {
        super(SurveyReply.getClass(), [obj.surveyKey, obj.studentID]);
        Object.assign(this, obj);
    }

    setCreatedAt(newTime) {
        this.createdAt = newTime;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    setUpdatedAt(newTime) {
        this.updatedAt = newTime;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    static fromBuffer(buffer) {
        return SurveyReply.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, SurveyReply);
    }

    static createInstance(surveyKey, studentID, resultKeys) {
        return new SurveyReply({ surveyKey, studentID, resultKeys });
    }

    static getClass() {
        return 'org.jnu.surveyreply';
    }
}

module.exports = SurveyReply;
