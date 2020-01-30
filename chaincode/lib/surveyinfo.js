
'use strict';

const State = require('../ledger-api/state.js');

const surveyState = {
    REGISTERED: 1,
    SURVEYING: 2,
    FINISHED: 3,
    REMOVED: 4
};

/**
 * SurveyInfo class extends State class
 * Class will be used by application and smart contract to define a survey information
 * Element : department, createdAt, updatedAt, managerID, title, startDate, finishDate, currentState
 * Class Name Marked by DNS : org.jnu.surveyinfo
 */
class SurveyInfo extends State {

    constructor(obj) {
        super(SurveyInfo.getClass(), [obj.department, obj.createdAt]);
        Object.assign(this, obj);
        this.currentState = null;
    }

    getDepartment() {
        return this.department;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    getManagerID() {
        return this.managerID;
    }

    getStartDate() {
        return this.startDate;
    }

    getFinishDate() {
        return this.finishDate;
    }

    getCurrentState() {
        return this.currentState;
    }

    setCreatedAt(newTime) {
        this.createdAt = newTime;
    }

    setUpdatedAt(newTime) {
        this.updatedAt = newTime;
    }


    setRegistered() {
        this.currentState = surveyState.REGISTERED;
    }

    setSurveying() {
        this.currentState = surveyState.SURVEYING;
    }

    setFinished() {
        this.currentState = surveyState.FINISHED;
    }

    setRemoved() {
        this.currentState = surveyState.REMOVED;
    }

    isRegistered() {
        return this.currentState === surveyState.REGISTERED;
    }

    isSurveying() {
        return this.currentState === surveyState.SURVEYING;
    }

    isFinished() {
        return this.currentState === surveyState.FINISHED;
    }

    isRemoved() {
        return this.currentState === surveyState.REMOVED;
    }

    static fromBuffer(buffer) {
        return SurveyInfo.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, SurveyInfo);
    }

    static makeKey(keyParts) {
        keyParts.unshift(SurveyInfo.getClass());
        return State.makeKey(keyParts);
    }

    static createInstance(department, createdAt, managerID, title, startDate, finishDate) {
        return new SurveyInfo({ department, createdAt, managerID, title, startDate, finishDate });
    }

    static getClass() {
        return 'org.jnu.surveyinfo';
    }
}

module.exports = SurveyInfo;
