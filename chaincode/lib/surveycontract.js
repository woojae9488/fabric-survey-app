'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// surveyNet specifc state classes
const Survey = require('./survey.js');
const SurveyQuestion = require('./question.js');
const SurveyReply = require('./reply.js');
const SurveyReplyResult = require('./result.js');

// surveyNet specifc statelist classes
const SurveyList = require('./surveylist.js');
const QuestionList = require('./questionlist.js');
const ReplyList = require('./replylist.js');
const ResultList = require('./resultlist.js');

/**
 * A custom context provides easy access to list of all survey elements
 */
class SurveyContext extends Context {

    constructor() {
        super();
        this.surveyList = new SurveyList(this);
        this.questionList = new QuestionList(this);
        this.replyList = new ReplyList(this);
        this.resultList = new ResultList(this);
    }

}

/**
 * Define survey smart contract by extending Fabric Contract class
 */
class SurveyContract extends Contract {

    /********************* Super class Method Override *********************/

    constructor() {
        super('org.jnu.survey');
    }

    createContext() {
        return new SurveyContext();
    }

    async beforeTransaction(ctx) {
        let txnDetails = ctx.stub.getFunctionAndParameters();
        console.info(`Calling function: ${txnDetails.fcn}`);
        console.info(`Function arguments : ${txnDetails.params}`);
    }

    async unknownTransaction(_ctx) {
        throw new Error('Unknown transaction function');
    }

    /********************* Survey State Change Method (User) *********************/

    async instantiate(_ctx) {
        console.log('Instantiate the contract');
    }

    async registerSurvey(ctx, department, managerID, title, startDate, finishDate, questionsJSONStr) {
        let survey = Survey.createInstance(department, Date.now(), managerID, title, startDate, finishDate);
        survey.setUpdatedAt(survey.getCreatedAt());
        survey.setRegistered();
        await ctx.surveyList.addSurvey(survey);

        let questions = JSON.parse(questionsJSONStr);
        await this.registerSurveyQuestions(ctx, questions);

        return survey;
    }

    async updateSurvey(ctx, department, createdAt, managerID, title, startDate, finishDate, questionsJSONStr) {
        let surveyKey = Survey.makeKey([department, createdAt]);
        let survey = await ctx.surveyList.getSurvey(surveyKey);
        if (!survey) {
            throw new Error('Can not found Survey = ' + surveyKey);
        }
        if (survey.getManagerID() !== managerID) {
            throw new Error('Survey ' + surveyKey + ' is not managed by ' + managerID);
        }
        if (!survey.isRegistered()) {
            throw new Error('Survey can only be updated in REGISTERED state. Current state = ' + survey.getCurrentState());
        }

        survey.setTitle(title);
        survey.setStartDate(startDate);
        survey.setFinishDate(finishDate);
        survey.setUpdatedAt(Date.now());
        await ctx.surveyList.updateSurvey(survey);

        await this.deleteSurveyQuestions(ctx, surveyKey);
        let questions = JSON.parse(questionsJSONStr);
        await this.registerSurveyQuestions(ctx, questions);

        return survey;
    }

    async respondReply(ctx, department, surveyCreatedAt, studentID, resultsJSONStr) {
        let surveyKey = Survey.makeKey([department, surveyCreatedAt]);
        let survey = await ctx.surveyList.getSurvey(surveyKey);
        if (!survey) {
            throw new Error('Can not found Survey = ' + surveyKey);
        }
        if (!survey.isSurveying()) {
            throw new Error('Reply can only be reponded in SURVEYING state. Current state = ' + survey.getCurrentState());
        }

        let reply = SurveyReply.createInstance(surveyKey, studentID, Date.now());
        reply.setUpdatedAt(reply.getCreatedAt());
        await ctx.replyList.addReply(reply);

        let results = JSON.parse(resultsJSONStr);
        await this.repondReplyResults(ctx, results);

        return reply;
    }

    async reviseReply(ctx, department, surveyCreatedAt, studentID, resultsJSONStr) {
        let surveyKey = Survey.makeKey([department, surveyCreatedAt]);
        let survey = await ctx.surveyList.getSurvey(surveyKey);
        if (!survey) {
            throw new Error('Can not found Survey = ' + surveyKey);
        }
        if (!survey.isSurveying()) {
            throw new Error('Reply can only be revised in SURVEYING state. Current state = ' + survey.getCurrentState());
        }

        let replyKey = SurveyReply.makeKey([surveyKey, studentID]);
        let reply = await ctx.replyList.getReply(replyKey);
        if (!reply) {
            throw new Error('Can not found Reply = ' + replyKey);
        }

        reply.setUpdatedAt(Date.now());
        await ctx.replyList.updateReply(reply);

        await this.deleteReplyResults(ctx, replyKey);
        let results = JSON.parse(resultsJSONStr);
        await this.repondReplyResults(ctx, results);

        return reply;
    }

    async removeSurvey(ctx, department, createdAt, managerID) {
        let surveyKey = Survey.makeKey([department, createdAt]);
        let survey = await ctx.surveyList.getSurvey(surveyKey);
        if (!survey) {
            throw new Error('Can not found Survey = ' + surveyKey);
        }
        if (survey.getManagerID() !== managerID) {
            throw new Error('Survey ' + surveyKey + ' is not managed by ' + managerID);
        }
        if (survey.isRemoved()) {
            throw new Error('Survey ' + surveyKey + ' already removed');
        }

        survey.setRemoved();
        await ctx.surveyList.updateSurvey(survey);

        return survey;
    }

    /********************* Survey State Change assistance Method (InClass) *********************/

    async registerSurveyQuestions(ctx, questions) {
        for (let i = 0; i < questions.length; i++) {
            let question = new SurveyQuestion(questions[i]);
            await ctx.questionList.addQuestion(question);
        }
    }

    async deleteSurveyQuestions(ctx, surveyKey) {
        let questions = await ctx.questionList.getQuestionsBySurveyKey(surveyKey);
        for (let i = 0; i < questions.length; i++) {
            await ctx.questionList.deleteQuestion(questions[i].key);
        }
    }

    async repondReplyResults(ctx, results) {
        for (let i = 0; i < results.length; i++) {
            let result = new SurveyReplyResult(results[i]);
            await ctx.resultList.addResult(result);
        }
    }

    async deleteReplyResults(ctx, replyKey) {
        let results = await ctx.resultList.getResultsByReplyKey(replyKey);
        for (let i = 0; i < results.length; i++) {
            await ctx.resultList.deleteResult(results[i].key);
        }
    }

    /********************* Survey State Change Method (WebApp) *********************/

    async start(ctx, department, createdAt) {
        let surveyKey = Survey.makeKey([department, createdAt]);
        let survey = await ctx.surveyList.getSurvey(surveyKey);
        if (!survey) {
            throw new Error('Can not found Survey = ' + surveyKey);
        }
        if (!survey.isRegistered()) {
            throw new Error('Survey can only be started in REGISTERED state. Current state = ' + survey.getCurrentState());
        }

        survey.setSurveying();
        await ctx.surveyList.updateSurvey(survey);

        return survey;
    }

    async finish(ctx, department, createdAt) {
        let surveyKey = Survey.makeKey([department, createdAt]);
        let survey = await ctx.surveyList.getSurvey(surveyKey);
        if (!survey) {
            throw new Error('Can not found Survey = ' + surveyKey);
        }
        if (!survey.isSurveying()) {
            throw new Error('Survey can only be finished in SURVEYING state. Current state = ' + survey.getCurrentState());
        }

        survey.setFinished();
        await ctx.surveyList.updateSurvey(survey);

        return survey;
    }

    /********************* Survey Query Method *********************/

    async querySurvey(ctx, department, createdAt) {
        let surveyKey = Survey.makeKey([department, createdAt]);
        let metadata = await ctx.surveyList.getSurvey(surveyKey);
        if (!metadata) {
            throw new Error('Can not found Survey = ' + surveyKey);
        }
        let questions = await ctx.questionList.getQuestionsBySurveyKey(surveyKey);
        return { metadata, questions };
    }

    async querySurveyInfosByDepartment(ctx, department) {
        let surveys = await ctx.surveyList.getSurveysByDepartment(department);
        return surveys;
    }

    async querySurveyInfosByDepartmentWithPagination(ctx, department, pageSize, surveyBookmark) {
        let surveys = await ctx.surveyList.getSurveysByDepartmentWithPagination(department, pageSize, surveyBookmark);
        return surveys;
    }

    async querySurveyInfosByRange(ctx, department, startCreatedAt, endCreatedAt) {
        let surveyStart = Survey.makeKey([department, startCreatedAt]);
        let surveyEnd = Survey.makeKey([department, endCreatedAt]);
        let surveys = await ctx.surveyList.getSurveysByRange(surveyStart, surveyEnd);
        return surveys;
    }

    async querySurveyInfosByRangeWithPagination(ctx, department, startCreatedAt, endCreatedAt, pageSize, surveyBookmark) {
        let surveyStart = Survey.makeKey([department, startCreatedAt]);
        let surveyEnd = Survey.makeKey([department, endCreatedAt]);
        let surveys = await ctx.surveyList.getSurveysByRangeWithPagination(surveyStart, surveyEnd, pageSize, surveyBookmark);
        return surveys;
    }

    async queryReply(ctx, department, surveyCreatedAt, studentID) {
        let surveyKey = Survey.makeKey([department, surveyCreatedAt]);
        let replyKey = SurveyReply.makeKey([surveyKey, studentID]);
        let metadata = await ctx.replyList.getReply(replyKey);
        if (!metadata) {
            throw new Error('Can not found Reply = ' + replyKey);
        }
        let results = await ctx.resultList.getResultsByReplyKey(replyKey);
        return { metadata, results };
    }

    async querySurveyReplies(ctx, department, surveyCreatedAt) {
        let replies = [];
        let surveyKey = Survey.makeKey([department, surveyCreatedAt]);
        let metadatas = await ctx.replyList.getRepliesBySurveyKey(surveyKey);

        for (let i = 0; i < metadatas.length; i++) {
            let metadata = metadatas[i];
            let results = await ctx.resultList.getResultsByReplyKey(metadata.key);
            replies.push({ metadata, results });
        }
        return replies;
    }

    async querySurveyRepliesByRange(ctx, department, surveyCreatedAt, startStudentID, endStudentID) {
        let replies = [];
        let surveyKey = Survey.makeKey([department, surveyCreatedAt]);
        let replyStart = Survey.makeKey([surveyKey, startStudentID]);
        let replyEnd = Survey.makeKey([surveyKey, endStudentID]);
        let metadatas = await ctx.replyList.getRepliesByRange(replyStart, replyEnd);

        for (let i = 0; i < metadatas.length; i++) {
            let metadata = metadatas[i];
            let results = await ctx.resultList.getResultsByReplyKey(metadata.key);
            replies.push({ metadata, results });
        }
        return replies;
    }

    async querySurveyRepliesByRangeWithPagination(ctx, department, surveyCreatedAt, startStudentID, endStudentID, pageSize, replyBookmark) {
        let replies = [];
        let surveyKey = Survey.makeKey([department, surveyCreatedAt]);
        let replyStart = Survey.makeKey([surveyKey, startStudentID]);
        let replyEnd = Survey.makeKey([surveyKey, endStudentID]);
        let metadatas = await ctx.replyList.getRepliesByRangeWithPagination(replyStart, replyEnd, pageSize, replyBookmark);

        for (let i = 0; i < metadatas.length; i++) {
            let metadata = metadatas[i];
            let results = await ctx.resultList.getResultsByReplyKey(metadata.key);
            replies.push({ metadata, results });
        }
        return replies;
    }
}

module.exports = SurveyContract;
