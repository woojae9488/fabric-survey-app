
'use strict';

const fs = require('fs');
const path = require('path');
const nodeschedule = require('node-schedule');

const network = require('../network.js');
const config = require('../config.js').connection;
const connectionType = config.connectionType;

const surveyInfosPath = path.join(__dirname, './surveydate.json');
const scheduleJobs = {};

function initSurveySchedule() {
    console.log('Start to initialize survey schedule.');
    let surveyInfosJSON = fs.readFileSync(surveyInfosPath, 'utf8');
    let surveyInfos = JSON.parse(surveyInfosJSON);

    for (let i = 0; i < surveyInfos.length; i++) {
        console.log(`Survey schedule ${i}: ${surveyInfos[i]}`);
        let surveyInfo = surveyInfos[i];
        let scheduleJob = reserveSurveyDate(surveyInfo);
        scheduleJobs[surveyInfo.key] = scheduleJob;
    }
}

function addSurveySchedule(surveyInfoBuffer) {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Add survey schedule: ${surveyInfo}`);

    let scheduleJob = reserveSurveyDate(surveyInfo);
    scheduleJobs[surveyInfo.key] = scheduleJob;
    addManagedSurvey(surveyInfo);
}

function updateSurveySchedule(surveyInfoBuffer) {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Update survey schedule: ${surveyInfo}`);

    let scheduleJob = scheduleJobs[surveyInfo.key];
    cancelSurveySchedule(scheduleJob);

    let newScheduleJob = reserveSurveyDate(surveyInfo);
    scheduleJobs[surveyInfo.key] = newScheduleJob;
    updateManagedSurvey(surveyInfo);
}

function removeSurveySchedule(surveyInfoBuffer) {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Remove survey schedule: ${surveyInfo}`);

    let scheduleJob = scheduleJobs[surveyInfo.key];
    cancelSurveySchedule(scheduleJob);
    delete scheduleJobs[surveyInfo.key];

    removeManagedSurvey(surveyInfo.key);
}


function reserveSurveyDate(surveyInfo) {
    let department = surveyInfo.department;
    let createdAt = surveyInfo.createdAt;
    let surveyInfoKey = surveyInfo.key;

    let startDate = new Date(parseInt(surveyInfo.startDate));
    let finishDate = new Date(parseInt(surveyInfo.finishDate));

    let startJob = nodeschedule.scheduleJob(startDate, async function () {
        let networkObj = await network.connect(connectionType.MANAGER, config.appAdmin);
        await network.invoke(networkObj, 'start', department, createdAt);
        console.log(`Survey ${department}.${createdAt} start!!`);
    });
    let finishJob = nodeschedule.scheduleJob(finishDate, async function () {
        let networkObj = await network.connect(connectionType.MANAGER, config.appAdmin);
        await network.invoke(networkObj, 'finish', department, createdAt);
        console.log(`Survey ${department}.${createdAt} finish!!`);

        removeManagedSurvey(surveyInfoKey);
        console.log(`Survey ${department}.${createdAt} removed!!`);
    });

    console.log(`Reserve survey schedule successly: ${surveyInfo}`);
    console.log(`Start job: ${startJob}`);
    console.log(`Finish job: ${finishJob}`);
    return { start: startJob, finish: finishJob };
}

function cancelSurveySchedule(scheduleJob) {
    let startJob = scheduleJob.start;
    let finishJob = scheduleJob.finish;
    startJob.cancel();
    finishJob.cancel();
    console.log(`Cancel survey schedule successly: ${scheduleJob}`);
}


function addManagedSurvey(surveyInfo) {
    let surveyInfosJSON = fs.readFileSync(surveyInfosPath, 'utf8');
    let surveyInfos = JSON.parse(surveyInfosJSON);

    surveyInfos.push(surveyInfo);
    surveyInfosJSON = JSON.stringify(surveyInfos);
    fs.writeFileSync(surveyInfosPath, surveyInfosJSON, 'utf8');
    console.log(`Add managed survey successly: ${surveyInfo}`);
}

function updateManagedSurvey(surveyInfo) {
    let surveyInfosJSON = fs.readFileSync(surveyInfosPath, 'utf8');
    let surveyInfos = JSON.parse(surveyInfosJSON);

    surveyInfo = surveyInfos.find(data => data.key === surveyInfo.key);
    surveyInfos.splice(surveyInfos.indexOf(surveyInfo), 1);
    surveyInfos.push(surveyInfo);
    surveyInfosJSON = JSON.stringify(surveyInfos);
    fs.writeFileSync(surveyInfosPath, surveyInfosJSON, 'utf8');
    console.log(`Update managed survey successly: ${surveyInfo}`);
}

function removeManagedSurvey(surveyInfoKey) {
    let surveyInfosJSON = fs.readFileSync(surveyInfosPath, 'utf8');
    let surveyInfos = JSON.parse(surveyInfosJSON);

    surveyInfo = surveyInfos.find(data => data.key === surveyInfoKey);
    surveyInfos.splice(surveyInfos.indexOf(surveyInfo), 1);
    surveyInfosJSON = JSON.stringify(surveyInfos);
    fs.writeFileSync(surveyInfosPath, surveyInfosJSON, 'utf8');
    console.log(`Remove managed survey successly: ${surveyInfo}`);
}

exports.initSurveySchedule = initSurveySchedule;
exports.addSurveySchedule = addSurveySchedule;
exports.updateSurveySchedule = updateSurveySchedule;
exports.removeSurveySchedule = removeSurveySchedule;
exports.scheduleJobs = scheduleJobs;