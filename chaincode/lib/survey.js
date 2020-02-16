
'use strict';

const State = require('../ledger-api/State.js');
const SurveyInfo = require('./SurveyInfo.js');
const SurveyQuestion = require('./SurveyQuestion.js');

class Survey {

    constructor(obj) {
        const surveyInfoKey = obj.surveyInfo.getKey();
        this.surveyKey = Survey.makeSurveyKeyByInfoKey(surveyInfoKey);
        Object.assign(this, obj);
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

    static fromString(objStr) {
        const json = JSON.parse(objStr);
        const surveyInfo = new SurveyInfo(json.surveyInfo);

        const questions = [];
        const jsonQuestions = json.questions;
        jsonQuestions.forEach((jsonQuestion) => {
            questions.push(new SurveyQuestion(jsonQuestion));
        });

        return new Survey({ surveyInfo, questions });
    }

    toString() {
        return JSON.stringify(this);
    }

    static makeSurveyKey(department, createdAt) {
        return [department, createdAt].join('_');
    }

    static makeSurveyKeyByInfoKey(surveyInfoKey) {
        const keyParts = State.splitKey(surveyInfoKey);
        keyParts.shift();
        return keyParts.join('_');
    }

    static makeInfoKeyBySurveyKey(surveyKey) {
        const keyParts = surveyKey.split('_');
        return SurveyInfo.makeKey(keyParts);
    }

    static createInstance(department, createdAt, managerID, title, startDate, finishDate) {
        const surveyInfo = SurveyInfo.createInstance(department, createdAt, managerID, title, startDate, finishDate);
        const questions = [];
        return new Survey({ surveyInfo, questions });
    }

    addQuestion(questionNum, title, type, contents) {
        const question = SurveyQuestion.createInstance(this.surveyKey, questionNum, title, type, contents);
        this.questions.push(question);
    }

}

module.exports = Survey;
