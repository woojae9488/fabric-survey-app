
'use strict';

const State = require('../ledger-api/state.js');

const surveyState = {
    REGISTERED: 1,
    SURVEYING: 2,
    FINISHED: 3,
    REMOVED: 4
};

class Survey extends State {

    constructor(obj) {
        super(Survey.getClass(), [obj.department, obj.surveyNum]);
        Object.assign(this, obj);
    }

    getManager() {
        return this.manager;
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
        return Survey.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, Survey);
    }

    static createInstance(department, surveyNum, managerID, title, questionKeys, startDate, finishDate) {
        return new Survey({ department, surveyNum, managerID, title, questionKeys, startDate, finishDate });
    }

    static getClass() {
        return 'org.jnu.survey';
    }
}

module.exports = Survey;
