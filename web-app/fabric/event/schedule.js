
'use strict';

const network = require('../network.js');
const SurveyInfo = require('../../../chaincode/lib/surveyinfo.js');

const path = require('path');
const fs = require('fs');
const nodeschedule = require('node-schedule');

const configPath = path.join(process.cwd(), './fabric/config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
const connectionType = config.connectionType;

const surveyDatesPath = path.join(__dirname, './surveydate.json');
const scheduleJobs = {};

function initSurveySchedule() {
    let surveyDatesJSON = fs.readFileSync(surveyDatesPath, 'utf8');
    let surveyDates = JSON.parse(surveyDatesJSON);

    for (let i = 0; i < surveyDates.length; i++) {
        let surveyInfo = new SurveyInfo(surveyDates[i]);
        let scheduleJob = reserveSurveyDate(surveyInfo);
        scheduleJobs[surveyInfo.getKey()] = scheduleJob;
    }
}

function addSurveySchedule(surveyInfoBuffer) {
    const surveyInfo = SurveyInfo.fromBuffer(surveyInfoBuffer);
    console.log(`Add survey schedule: ${surveyInfo}`);

    let scheduleJob = reserveSurveyDate(surveyInfo);
    scheduleJobs[surveyInfo.getKey()] = scheduleJob;
    addManagedSurvey(surveyInfo);
}


function updateSurveySchedule(surveyInfoBuffer) {
    const surveyInfo = SurveyInfo.fromBuffer(surveyInfoBuffer);
    console.log(`Update survey schedule: ${surveyInfo}`);

    let scheduleJob = scheduleJobs[surveyInfo.getKey()];
    cancelSurveySchedule(scheduleJob);

    let newScheduleJob = reserveSurveyDate(surveyInfo);
    scheduleJobs[surveyInfo.getKey()] = newScheduleJob;
    updateManagedSurvey(surveyInfo);
}

function removeSurveySchedule(surveyInfoBuffer) {
    const surveyInfo = SurveyInfo.fromBuffer(surveyInfoBuffer);
    console.log(`Remove survey schedule: ${surveyInfo}`);

    let scheduleJob = scheduleJobs[surveyInfo.getKey()];
    cancelSurveySchedule(scheduleJob);
    delete scheduleJobs[surveyInfo.getKey()];

    removeManagedSurvey(surveyInfo);
}

function reserveSurveyDate(surveyInfo) {
    let department = surveyInfo.getDepartment();
    let createdAt = surveyInfo.getCreatedAt();

    let startDate = surveyInfo.getStartDate();
    let sDate = new Date(parseInt(startDate));
    let finishDate = surveyInfo.getFinishDate();
    let fDate = new Date(parseInt(finishDate));

    let startJob = nodeschedule.scheduleJob(sDate, async function () {
        let networkObj = await network.connect(connectionType.MANAGER, config.appAdmin);
        await network.invoke(networkObj, 'start', department, createdAt);
        console.log(`Survey ${department}.${createdAt} start!!`);
    });
    let finishJob = nodeschedule.scheduleJob(fDate, async function () {
        let networkObj = await network.connect(connectionType.MANAGER, config.appAdmin);
        await network.invoke(networkObj, 'finish', department, createdAt);
        console.log(`Survey ${department}.${createdAt} finish!!`);

        removeManagedSurvey(surveyInfo);
        console.log(`Survey ${department}.${createdAt} removed!!`);
    });

    return { start: startJob, finish: finishJob };
}

function cancelSurveySchedule(scheduleJob) {
    let startJob = scheduleJob.start;
    let finishJob = scheduleJob.finish;
    startJob.cancel();
    finishJob.cancel();
}

function addManagedSurvey(surveyInfo) {
    let surveyDatesJSON = fs.readFileSync(surveyDatesPath, 'utf8');
    let surveyDates = JSON.parse(surveyDatesJSON);

    surveyDates.push(surveyInfo);
    surveyDatesJSON = JSON.stringify(surveyDates);
    fs.writeFileSync(surveyDatesPath, surveyDatesJSON, 'utf8');
}

function updateManagedSurvey(surveyInfo) {
    let surveyDatesJSON = fs.readFileSync(surveyDatesPath, 'utf8');
    let surveyDates = JSON.parse(surveyDatesJSON);

    surveyDates = surveyDates.filter(survey => survey.getKey() !== surveyInfo.getKey());
    surveyDates.push(surveyInfo);
    surveyDatesJSON = JSON.stringify(surveyDates);
    fs.writeFileSync(surveyDatesPath, surveyDatesJSON, 'utf8');
}

function removeManagedSurvey(surveyInfo) {
    let surveyDatesJSON = fs.readFileSync(surveyDatesPath, 'utf8');
    let surveyDates = JSON.parse(surveyDatesJSON);

    // advance array delete routine!
    surveyDates = surveyDates.filter(survey => survey.getKey() !== surveyInfo.getKey());
    surveyDatesJSON = JSON.stringify(surveyDates);
    fs.writeFileSync(surveyDatesPath, surveyDatesJSON, 'utf8');
}

exports.initSurveySchedule = initSurveySchedule;
exports.addSurveySchedule = addSurveySchedule;
exports.updateSurveySchedule = updateSurveySchedule;
exports.removeSurveySchedule = removeSurveySchedule;
exports.scheduleJobs = scheduleJobs;