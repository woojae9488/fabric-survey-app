// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// surveyNet specifc state classes
const Survey = require('./Survey.js');
const SurveyInfo = require('./SurveyInfo.js');
const SurveyList = require('./SurveyList.js');
const Reply = require('./Reply.js');
const ReplyInfo = require('./ReplyInfo.js');
const ReplyList = require('./ReplyList.js');

// surveyNet specifc private data classes
const User = require('./User.js');
const UserList = require('./UserList.js');

/**
 * A custom context provides easy access to list of all survey elements
 */
class SurveyContext extends Context {
    constructor() {
        super();
        this.surveyList = new SurveyList(this);
        this.replyList = new ReplyList(this);
        this.studentList = new UserList(this, 'studentCollection');
        this.managerList = new UserList(this, 'managerCollection');
    }
}

/**
 * Define survey smart contract by extending Fabric Contract class
 */
class SurveyContract extends Contract {
    /** ******************* Super class Method Override ******************** */

    constructor() {
        super('org.jnu.survey');
    }

    createContext() {
        return new SurveyContext();
    }

    async beforeTransaction(ctx) {
        const txnDetails = ctx.stub.getFunctionAndParameters();
        console.info(`Calling function: ${txnDetails.fcn}`);
        console.info(`Function arguments: ${txnDetails.params}`);
    }

    async unknownTransaction() {
        throw new Error('Unknown transaction function');
    }

    async instantiate() {
        console.log('Instantiate the survey contract');
    }

    /** ******************* Survey State Change Method (User) ******************** */

    async register(ctx, surveyStr) {
        const survey = Survey.fromString(surveyStr);
        const surveyInfo = survey.getSurveyInfo();

        surveyInfo.setUpdatedAt(surveyInfo.getCreatedAt());
        surveyInfo.setRegistered();
        await ctx.surveyList.addSurvey(survey);
        await ctx.surveyList.setSurveyEvent('Register', surveyInfo);

        return survey;
    }

    async update(ctx, surveyStr) {
        const newSurvey = Survey.fromString(surveyStr);
        const newSurveyInfo = newSurvey.getSurveyInfo();
        const surveyInfoKey = newSurveyInfo.getKey();

        const surveyInfo = await ctx.surveyList.getSurveyInfo(surveyInfoKey);
        if (!surveyInfo) {
            throw new Error(`Can not found Survey = ${surveyInfoKey}`);
        }
        if (surveyInfo.getManagerID() !== newSurveyInfo.getManagerID()) {
            throw new Error(`Survey ${surveyInfoKey} is not managed by ${newSurveyInfo.getManagerID()}`);
        }
        if (!surveyInfo.isRegistered()) {
            throw new Error(
                `Survey can only be updated in REGISTERED state. Current state = ${surveyInfo.getCurrentState()}`,
            );
        }

        newSurveyInfo.setRegistered();
        newSurveyInfo.setUpdatedAt(Date.now());
        await ctx.surveyList.updateSurvey(newSurvey);
        await ctx.surveyList.setSurveyEvent('Update', newSurveyInfo);

        return newSurvey;
    }

    async remove(ctx, department, createdAt, managerID) {
        const surveyInfoKey = SurveyInfo.makeKey([department, createdAt]);
        const surveyInfo = await ctx.surveyList.getSurveyInfo(surveyInfoKey);
        if (!surveyInfo) {
            throw new Error(`Can not found Survey = ${surveyInfoKey}`);
        }
        if (surveyInfo.getManagerID() !== managerID) {
            throw new Error(`Survey ${surveyInfoKey} is not managed by ${managerID}`);
        }
        if (surveyInfo.isRemoved()) {
            throw new Error(`Survey ${surveyInfoKey} already removed`);
        }

        surveyInfo.setRemoved();
        await ctx.surveyList.updateSurveyInfo(surveyInfo);
        await ctx.surveyList.setSurveyEvent('Remove', surveyInfo);

        return surveyInfo;
    }

    async respond(ctx, replyStr) {
        const reply = Reply.fromString(replyStr);
        const replyInfo = reply.getReplyInfo();
        const surveyKey = replyInfo.getSurveyKey();
        const surveyInfoKey = Survey.makeInfoKeyBySurveyKey(surveyKey);

        const surveyInfo = await ctx.surveyList.getSurveyInfo(surveyInfoKey);
        if (!surveyInfo) {
            throw new Error(`Can not found Survey = ${surveyInfoKey}`);
        }
        if (!surveyInfo.isSurveying()) {
            throw new Error(
                `Reply can only be reponded in SURVEYING state. Current state = ${surveyInfo.getCurrentState()}`,
            );
        }

        replyInfo.setUpdatedAt(replyInfo.getCreatedAt());
        await ctx.replyList.addReply(reply);

        return reply;
    }

    async revise(ctx, replyStr) {
        const newReply = Reply.fromString(replyStr);
        const newReplyInfo = newReply.getReplyInfo();
        const replyInfoKey = newReplyInfo.getKey();
        const surveyKey = newReplyInfo.getSurveyKey();
        const surveyInfoKey = Survey.makeInfoKeyBySurveyKey(surveyKey);

        const surveyInfo = await ctx.surveyList.getSurveyInfo(surveyInfoKey);
        if (!surveyInfo) {
            throw new Error(`Can not found Survey = ${surveyInfoKey}`);
        }
        if (!surveyInfo.isSurveying()) {
            throw new Error(
                `Reply can only be reponded in SURVEYING state. Current state = ${surveyInfo.getCurrentState()}`,
            );
        }

        const replyInfo = await ctx.replyList.getReplyInfo(replyInfoKey);
        if (!replyInfo) {
            throw new Error(`Can not found Reply = ${replyInfoKey}`);
        }

        newReplyInfo.setUpdatedAt(Date.now());
        await ctx.replyList.updateReply(newReply);

        return newReply;
    }

    /** ******************* Survey State Change Method (WebApp) ******************** */

    async start(ctx, department, createdAt) {
        const surveyInfoKey = SurveyInfo.makeKey([department, createdAt]);
        const surveyInfo = await ctx.surveyList.getSurveyInfo(surveyInfoKey);
        if (!surveyInfo) {
            throw new Error(`Can not found Survey = ${surveyInfoKey}`);
        }
        if (!surveyInfo.isRegistered()) {
            throw new Error(
                `Survey can only be started in REGISTERED state. Current state = ${surveyInfo.getCurrentState()}`,
            );
        }

        surveyInfo.setSurveying();
        await ctx.surveyList.updateSurveyInfo(surveyInfo);

        return surveyInfo;
    }

    async finish(ctx, department, createdAt) {
        const surveyInfoKey = SurveyInfo.makeKey([department, createdAt]);
        const surveyInfo = await ctx.surveyList.getSurveyInfo(surveyInfoKey);
        if (!surveyInfo) {
            throw new Error(`Can not found Survey = ${surveyInfoKey}`);
        }
        if (!surveyInfo.isSurveying()) {
            throw new Error(
                `Survey can only be finished in SURVEYING state. Current state = ${surveyInfo.getCurrentState()}`,
            );
        }

        surveyInfo.setFinished();
        await ctx.surveyList.updateSurveyInfo(surveyInfo);

        return surveyInfo;
    }

    /** ******************* Survey State Query Method ******************** */

    async querySurvey(ctx, department, createdAt) {
        const surveyInfoKey = SurveyInfo.makeKey([department, createdAt]);
        const survey = await ctx.surveyList.getSurvey(surveyInfoKey);
        if (!survey.getSurveyInfo()) {
            throw new Error(`Can not found Survey = ${surveyInfoKey}`);
        }
        return survey;
    }

    async querySurveyInfos(ctx, department) {
        const surveyInfos = await ctx.surveyList.getSurveyInfosByDepartment(department);
        return SurveyList.getUnremovedFromSurveyInfos(surveyInfos);
    }

    async querySurveyInfosWithPagination(ctx, department, pageSize, bookmarkCreatedAt) {
        const surveyBookmark = SurveyList.makeSurveyBookmark(department, bookmarkCreatedAt);
        const surveyInfos = await ctx.surveyList.getSurveyInfosByDepartmentWithPagination(
            department,
            pageSize,
            surveyBookmark,
        );
        return SurveyList.getUnremovedFromSurveyInfos(surveyInfos);
    }

    async querySurveyInfosByRange(ctx, department, startCreatedAt, endCreatedAt) {
        const surveyInfoStart = SurveyInfo.makeKey([department, startCreatedAt]);
        const surveyInfoEnd = SurveyInfo.makeKey([department, endCreatedAt]);
        const surveyInfos = await ctx.surveyList.getSurveyInfosByRange(surveyInfoStart, surveyInfoEnd);
        return SurveyList.getUnremovedFromSurveyInfos(surveyInfos);
    }

    async querySurveyInfosByRangeWithPagination(
        ctx,
        department,
        startCreatedAt,
        endCreatedAt,
        pageSize,
        bookmarkCreatedAt,
    ) {
        const surveyInfoStart = SurveyInfo.makeKey([department, startCreatedAt]);
        const surveyInfoEnd = SurveyInfo.makeKey([department, endCreatedAt]);
        const surveyBookmark = SurveyList.makeSurveyBookmark(department, bookmarkCreatedAt);
        const surveyInfos = await ctx.surveyList.getSurveyInfosByRangeWithPagination(
            surveyInfoStart,
            surveyInfoEnd,
            pageSize,
            surveyBookmark,
        );
        return SurveyList.getUnremovedFromSurveyInfos(surveyInfos);
    }

    async queryReply(ctx, department, surveyCreatedAt, studentID) {
        const surveyKey = Survey.makeSurveyKey(department, surveyCreatedAt);
        const replyInfoKey = ReplyInfo.makeKey([surveyKey, studentID]);
        const reply = await ctx.replyList.getReply(replyInfoKey);
        if (!reply.getReplyInfo()) {
            throw new Error(`Can not found Reply = ${replyInfoKey}`);
        }
        return reply;
    }

    async queryReplies(ctx, department, surveyCreatedAt) {
        const surveyKey = Survey.makeSurveyKey(department, surveyCreatedAt);
        return await ctx.replyList.getRepliesBySurveyKey(surveyKey);
    }

    async queryRepliesByRange(ctx, department, surveyCreatedAt, startStudentID, endStudentID) {
        const surveyKey = Survey.makeSurveyKey(department, surveyCreatedAt);
        const replyInfoStart = ReplyInfo.makeKey([surveyKey, startStudentID]);
        const replyInfoEnd = ReplyInfo.makeKey([surveyKey, endStudentID]);
        return await ctx.replyList.getRepliesByRange(replyInfoStart, replyInfoEnd);
    }

    async queryRepliesByRangeWithPagination(
        ctx,
        department,
        surveyCreatedAt,
        startStudentID,
        endStudentID,
        pageSize,
        bookmarkStudentID,
    ) {
        const surveyKey = Survey.makeSurveyKey(department, surveyCreatedAt);
        const replyInfoStart = ReplyInfo.makeKey([surveyKey, startStudentID]);
        const replyInfoEnd = ReplyInfo.makeKey([surveyKey, endStudentID]);
        const replyBookmark = ReplyList.makeReplyBookmark(surveyKey, bookmarkStudentID);
        return await ctx.replyList.getRepliesByRangeWithPagination(
            replyInfoStart,
            replyInfoEnd,
            pageSize,
            replyBookmark,
        );
    }

    /** ******************* Survey User Method (User) ******************** */

    async registerStudent(ctx, id, password, name, departmentsStr) {
        const userKey = User.makeKey([id]);
        const userExists = await ctx.studentList.getUser(userKey);
        if (userExists) {
            throw new Error(`User ${userKey} already exists`);
        }

        const salt = User.makeSalt();
        const hashedPw = User.encryptPassword(password, salt);
        const departments = JSON.parse(departmentsStr);
        const user = User.createInstance(id, hashedPw, name, departments, salt, Date.now());
        user.setUpdatedAt(user.getCreatedAt());

        await ctx.studentList.addUser(user);
        return user;
    }

    async registerManager(ctx, id, password, departmentsStr) {
        const userKey = User.makeKey([id]);
        const userExists = await ctx.managerList.getUser(userKey);
        if (userExists) {
            throw new Error(`User ${userKey} already exists`);
        }

        const salt = User.makeSalt();
        const hashedPw = User.encryptPassword(password, salt);
        const departments = JSON.parse(departmentsStr);
        const user = User.createInstance(id, hashedPw, 'manager', departments, salt, Date.now());
        user.setUpdatedAt(user.getCreatedAt());

        await ctx.managerList.addUser(user);
        return user;
    }

    async updateStudent(ctx, id, password, name, departmentsStr) {
        const userKey = User.makeKey([id]);
        const user = await ctx.studentList.getUser(userKey);
        if (!user) {
            throw new Error(`Can not found User = ${userKey}`);
        }

        const salt = user.getSalt();
        const hashedPw = User.encryptPassword(password, salt);
        const departments = JSON.parse(departmentsStr);
        user.setHashedPw(hashedPw);
        user.setName(name);
        user.setDepartments(departments);
        user.setUpdatedAt(Date.now());

        await ctx.studentList.updateUser(user);
        return user;
    }

    async updateManager(ctx, id, password, departmentsStr) {
        const userKey = User.makeKey([id]);
        const user = await ctx.managerList.getUser(userKey);
        if (!user) {
            throw new Error(`Can not found User = ${userKey}`);
        }

        const salt = user.getSalt();
        const hashedPw = User.encryptPassword(password, salt);
        const departments = JSON.parse(departmentsStr);
        user.setHashedPw(hashedPw);
        user.setDepartments(departments);
        user.setUpdatedAt(Date.now());

        await ctx.managerList.updateUser(user);
        return user;
    }

    async deleteStudent(ctx, id, password) {
        const userKey = User.makeKey([id]);
        const user = await ctx.studentList.getUser(userKey);
        if (!user) {
            throw new Error(`Can not found User = ${userKey}`);
        }
        if (!user.authenticate(password)) {
            throw new Error(`user ${userKey} password is not matched`);
        }

        await ctx.studentList.deleteUser(userKey);
        return user;
    }

    async deleteManager(ctx, id, password) {
        const userKey = User.makeKey([id]);
        const user = await ctx.managerList.getUser(userKey);
        if (!user) {
            throw new Error(`Can not found User = ${userKey}`);
        }
        if (!user.authenticate(password)) {
            throw new Error(`user ${userKey} password is not matched`);
        }

        await ctx.managerList.deleteUser(userKey);
        return user;
    }

    /** ******************* Survey User Query Method ******************** */

    async queryStudent(ctx, id) {
        const userKey = User.makeKey([id]);
        const user = await ctx.studentList.getUser(userKey);
        if (!user) {
            throw new Error(`Can not found User = ${userKey}`);
        }

        return user;
    }

    async queryManager(ctx, id) {
        const userKey = User.makeKey([id]);
        const user = await ctx.managerList.getUser(userKey);
        if (!user) {
            throw new Error(`Can not found User = ${userKey}`);
        }

        return user;
    }

    async certifyStudent(ctx, id, password) {
        const userKey = User.makeKey([id]);
        const user = await ctx.studentList.getUser(userKey);
        if (!user) {
            throw new Error(`Can not found User = ${userKey}`);
        }
        if (!user.authenticate(password)) {
            throw new Error(`user ${userKey} password is not matched`);
        }

        return user;
    }

    async certifyManager(ctx, id, password) {
        const userKey = User.makeKey([id]);
        const user = await ctx.managerList.getUser(userKey);
        if (!user) {
            throw new Error(`Can not found User = ${userKey}`);
        }
        if (!user.authenticate(password)) {
            throw new Error(`user ${userKey} password is not matched`);
        }

        return user;
    }
}

module.exports = SurveyContract;
