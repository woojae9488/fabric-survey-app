
'use strict';

const StateList = require('../ledger-api/statelist.js');

const Survey = require('./survey.js');

class SurveyList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.jnu.surveylist');
        this.use(Survey);
    }

    async addSurvey(survey) {
        return this.addState(survey);
    }

    async getSurvey(surveyKey) {
        return this.getState(surveyKey);
    }

    async getSurveysByDepartment(department){
        return this.getStatesByPartialKey(department);
    }

    async updateSurvey(survey) {
        return this.updateState(survey);
    }

    async deleteSurvey(surveyKey){
        return this.deleteState(surveyKey);
    }
}


module.exports = SurveyList;