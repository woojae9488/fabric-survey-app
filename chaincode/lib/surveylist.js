
'use strict';

const StateList = require('../ledger-api/statelist.js');

const Survey = require('./survey.js');
const SurveyInfo = require('./surveyinfo.js');
const SurveyQuestion = require('./surveyquestion.js');

class SurveyList extends StateList {

    constructor(ctx) {
        super(ctx);
        this.use(SurveyInfo);
        this.use(SurveyQuestion);
    }

    async addSurvey(survey) {
        let surveyInfo = survey.getSurveyInfo();
        let questions = survey.getQuestions();

        await this.addState(surveyInfo);
        for (let i = 0; i < questions.length; i++) {
            await this.addState(questions[i]);
        }
    }

    async getSurvey(surveyInfoKey) {
        let surveyInfo = await this.getState(surveyInfoKey);

        let surveyKey = Survey.makeSurveyKeyByInfoKey(surveyInfoKey);
        let questionsKey = SurveyQuestion.makeKey([surveyKey]);
        let questions = await this.getStatesByPartialKey(questionsKey);

        return new Survey({ surveyInfo, questions });
    }

    async getSurveyInfo(surveyInfoKey) {
        return this.getState(surveyInfoKey);
    }

    async updateSurveyInfo(surveyInfoKey) {
        return this.updateState(surveyInfoKey);
    }

    async getSurveyInfosByDepartment(department) {
        let surveyInfosKey = SurveyInfo.makeKey([department]);
        let surveyInfos = await this.getStatesByPartialKey(surveyInfosKey);
        return surveyInfos;
    }

    async getSurveyInfosByDepartmentWithPagination(department, pageSize, surveyBookmark) {
        let surveyInfosKey = SurveyInfo.makeKey([department]);
        let surveyInfos = await this.getStatesByPartialKeyWithPagination(surveyInfosKey, pageSize, surveyBookmark);
        return surveyInfos;
    }

    async getSurveyInfosByRange(surveyInfoStart, surveyInfoEnd) {
        return this.getStatesByRange(surveyInfoStart, surveyInfoEnd);
    }

    async getSurveyInfosByRangeWithPagination(surveyInfoStart, surveyInfoEnd, pageSize, surveyBookmark) {
        return this.getStatesByRangeWithPagination(surveyInfoStart, surveyInfoEnd, pageSize, surveyBookmark);
    }

    async updateSurvey(survey) {
        let surveyInfo = survey.getSurveyInfo();
        let questions = survey.getQuestions();
        let surveyKey = Survey.makeSurveyKeyByInfoKey(surveyInfo.getKey());

        await this.updateState(surveyInfo);
        await this.deleteQuestions(surveyKey);
        for (let i = 0; i < questions.length; i++) {
            await this.addState(questions[i]);
        }
    }

    async deleteQuestions(surveyKey) {
        let questionsKey = SurveyQuestion.makeKey([surveyKey]);
        let questions = await this.getStatesByPartialKey(questionsKey);

        for (let i = 0; i < questions.length; i++) {
            await this.deleteState(questions[i].getKey());
        }
    }

    makeSurveyBookmark(department, createdAt) {
        let surveyInfoKey = SurveyInfo.makeKey([department, createdAt]);
        return this.makeBookmark(surveyInfoKey);
    }
}

module.exports = SurveyList;