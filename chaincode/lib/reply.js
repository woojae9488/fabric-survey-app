
'use strict';

const State = require('../ledger-api/state.js');

/**
 * SurveyReply class extends State class
 * Class will be used by application and smart contract to define a survey reply
 * Element : surveyKey, studentID, createdAt, updatedAt
 * Class Name Marked by DNS : org.jnu.surveyreply
 */
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

    static createInstance(surveyKey, studentID, createdAt) {
        return new SurveyReply({ surveyKey, studentID, createdAt });
    }

    static getClass() {
        return 'org.jnu.surveyreply';
    }
}

module.exports = SurveyReply;
