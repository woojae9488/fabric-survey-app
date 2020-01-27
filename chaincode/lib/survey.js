
'use strict';

const State = require('../ledger-api/state.js');

const surveyState = {
    REGISTERED: 1,
    SURVEYING: 2,
    FINISHED: 3,
    REMOVED: 4
};

/**
 * Survey class extends State class
 * Class will be used by application and smart contract to define a survey
 * Element : department, createdAt, updatedAt, managerID, title, startDate, finishDate, currentState
 * Class Name Marked by DNS : org.jnu.survey
 */
class Survey extends State {

    constructor(obj) {
        super(Survey.getClass(), [obj.department, obj.createdAt]);
        Object.assign(this, obj);
        this.currentState = null;
    }

    getCurrentState(){
        return this.currentState;
    }

    getManagerID() {
        return this.managerID;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    setCreatedAt(newTime) {
        this.createdAt = newTime;
    }

    setUpdatedAt(newTime) {
        this.updatedAt = newTime;
    }

    setTitle(newTitle){
        this.title = newTitle;
    }

    setStartDate(newStartDate){
        this.startDate = newStartDate;
    }

    setFinishDate(newFinishDate){
        this.finishDate = newFinishDate;
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

    static createInstance(department, createdAt, managerID, title, startDate, finishDate) {
        return new Survey({ department, createdAt, managerID, title, startDate, finishDate });
    }

    static getClass() {
        return 'org.jnu.survey';
    }
}

module.exports = Survey;
