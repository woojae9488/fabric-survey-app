
'use strict';

const State = require('../ledger-api/state.js');
const SurveyInfo = require('./surveyinfo.js');
const SurveyQuestion = require('./surveyquestion.js');

class Survey {

    constructor(obj) {
        Object.assign(this, obj);
        let surveyInfoKey = this.surveyInfo.getKey();
        this.surveyKey = Survey.makeSurveyKeyByInfoKey(surveyInfoKey);
    }

    getSurveyKey() {
        return this.surveyKey;
    }

    setSurveyInfo(newSurveyInfo) {
        this.surveyInfo = newSurveyInfo;
    }

    getSurveyInfo() {
        return this.surveyInfo;
    }

    setQuestions(newQuestions) {
        this.questions = newQuestions;
    }

    getQuestions() {
        return this.questions;
    }

    static fromBuffer(buffer) {
        let json = JSON.parse(buffer.toString());
        let surveyInfo = new SurveyInfo(json.surveyInfo);

        let questions = [];
        let jsonQuestions = json.questions;
        for (let i = 0; i < jsonQuestions.length; i++) {
            questions.push(new SurveyQuestion(jsonQuestions[i]));
        }

        return new Survey({ surveyInfo, questions });
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static makeSurveyKey(department, createdAt) {
        return [department, createdAt].join('.');
    }

    static makeSurveyKeyByInfoKey(surveyInfoKey) {
        let keyParts = State.splitKey(surveyInfoKey);
        keyParts.shift();
        return keyParts.join('.');
    }

    static makeInfoKeyBySurveyKey(surveyKey) {
        let keyParts = surveyKey.split('.');
        return SurveyInfo.makeKey(keyParts);
    }

    static createInstance(department, createdAt, managerID, title, startDate, finishDate) {
        let surveyInfo = SurveyInfo.createInstance(department, createdAt, managerID, title, startDate, finishDate);
        let questions = [];
        return new Survey({ surveyInfo, questions });
    }

    addQuestion(questionNum, title, type, contents) {
        let question = SurveyQuestion.createInstance(this.surveyKey, questionNum, title, type, contents);
        this.questions.push(question);
    }

}

module.exports = Survey;
