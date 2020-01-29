
'use strict';

const State = require('../ledger-api/state.js');

/**
 * ReplyInfo class extends State class
 * Class will be used by application and smart contract to define a survey reply information
 * Element : surveyKey, studentID, createdAt, updatedAt
 * Class Name Marked by DNS : org.jnu.replyinfo
 */
class ReplyInfo extends State {

    constructor(obj) {
        super(ReplyInfo.getClass(), [obj.surveyKey, obj.studentID]);
        Object.assign(this, obj);
    }

    getSurveyKey() {
        return this.surveyKey;
    }

    getStudentID() {
        return this.studentID;
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
        return ReplyInfo.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, ReplyInfo);
    }

    static makeKey(keyParts) {
        keyParts.unshift(ReplyInfo.getClass());
        return State.makeKey(keyParts);
    }

    static createInstance(surveyKey, studentID, createdAt) {
        return new ReplyInfo({ surveyKey, studentID, createdAt });
    }

    static getClass() {
        return 'org.jnu.replyinfo';
    }
}

module.exports = ReplyInfo;
