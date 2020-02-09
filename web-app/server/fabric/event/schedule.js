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

async function addSurveySchedule(surveyInfoBuffer) {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Add survey schedule: ${surveyInfo}`);

    let scheduleJob = reserveSurveyDate(surveyInfo);
    scheduleJobs[surveyInfo.key] = scheduleJob;
    await addManagedSurvey(surveyInfo);
}

async function updateSurveySchedule(surveyInfoBuffer) {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Update survey schedule: ${surveyInfo}`);

    let scheduleJob = scheduleJobs[surveyInfo.key];
    cancelSurveySchedule(scheduleJob);

    let newScheduleJob = reserveSurveyDate(surveyInfo);
    scheduleJobs[surveyInfo.key] = newScheduleJob;
    await updateManagedSurvey(surveyInfo);
}

async function removeSurveySchedule(surveyInfoBuffer) {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Remove survey schedule: ${surveyInfo}`);

    let scheduleJob = scheduleJobs[surveyInfo.key];
    cancelSurveySchedule(scheduleJob);
    delete scheduleJobs[surveyInfo.key];

    await removeManagedSurvey(surveyInfo.key);
}


function reserveSurveyDate(surveyInfo) {
    let department = surveyInfo.department;
    let createdAt = surveyInfo.createdAt;
    let surveyInfoKey = surveyInfo.key;

    let startDate = new Date(parseInt(surveyInfo.startDate));
    let finishDate = new Date(parseInt(surveyInfo.finishDate));

    let startJob = nodeschedule.scheduleJob(startDate, async () => {
        let networkObj = await network.connect(connectionType.MANAGER, config.appAdmin);
        let contractRes = await network.invoke(networkObj, 'start', department, createdAt);
        if (networkObj.error || contractRes.error) {
            console.log(networkObj.error || contractRes.error);
        } else {
            console.log(`Survey ${department}.${createdAt} start!!`);
        }
    });
    let finishJob = nodeschedule.scheduleJob(finishDate, async () => {
        let networkObj = await network.connect(connectionType.MANAGER, config.appAdmin);
        let contractRes = await network.invoke(networkObj, 'finish', department, createdAt);
        if (networkObj.error || contractRes.error) {
            console.log(networkObj.error || contractRes.error);
            return;
        }
        console.log(`Survey ${department}.${createdAt} finish!!`);

        await removeManagedSurvey(surveyInfoKey);
        console.log(`Survey ${department}.${createdAt} removed!!`);
    });

    console.log(`Reserve survey schedule successly: ${surveyInfo}`);
    console.log(`Start job: ${startJob}`);
    console.log(`Finish job: ${finishJob}`);
    return { start: startJob, finish: finishJob };
}

function cancelSurveySchedule(scheduleJob) {
    scheduleJob.start.cancel();
    scheduleJob.finish.cancel();
    console.log(`Cancel survey schedule successly: ${scheduleJob}`);
}

function addManagedSurvey(surveyInfo) {
    return new Promise((resolve, reject) => {
        try {
            let surveyInfosJSON = fs.readFileSync(surveyInfosPath, 'utf8');
            let surveyInfos = JSON.parse(surveyInfosJSON);

            surveyInfos.push(surveyInfo);
            surveyInfosJSON = JSON.stringify(surveyInfos);
            fs.writeFileSync(surveyInfosPath, surveyInfosJSON, 'utf8');
            console.log(`Add managed survey successly: ${surveyInfo}`);

            resolve();
        } catch (err) {
            console.error(`Fail to add managed survey: ${err}`);
            reject(err);
        }
    });
}

function updateManagedSurvey(surveyInfo) {
    return new Promise((resolve, reject) => {
        try {
            let surveyInfosJSON = fs.readFileSync(surveyInfosPath, 'utf8');
            let surveyInfos = JSON.parse(surveyInfosJSON);

            surveyInfo = surveyInfos.find(data => data.key === surveyInfo.key);
            surveyInfos.splice(surveyInfos.indexOf(surveyInfo), 1);
            surveyInfos.push(surveyInfo);
            surveyInfosJSON = JSON.stringify(surveyInfos);
            fs.writeFileSync(surveyInfosPath, surveyInfosJSON, 'utf8');
            console.log(`Update managed survey successly: ${surveyInfo}`);

            resolve();
        } catch (err) {
            console.error(`Fail to update managed survey: ${err}`);
            reject(err);
        }
    });
}

function removeManagedSurvey(surveyInfoKey) {
    return new Promise((resolve, reject) => {
        try {
            let surveyInfosJSON = fs.readFileSync(surveyInfosPath, 'utf8');
            let surveyInfos = JSON.parse(surveyInfosJSON);

            surveyInfo = surveyInfos.find(data => data.key === surveyInfoKey);
            surveyInfos.splice(surveyInfos.indexOf(surveyInfo), 1);
            surveyInfosJSON = JSON.stringify(surveyInfos);
            fs.writeFileSync(surveyInfosPath, surveyInfosJSON, 'utf8');
            console.log(`Remove managed survey successly: ${surveyInfo}`);

            resolve();
        } catch (err) {
            console.error(`Fail to remove managed survey: ${err}`);
            reject(err);
        }
    });
}

exports.initSurveySchedule = initSurveySchedule;
exports.addSurveySchedule = addSurveySchedule;
exports.updateSurveySchedule = updateSurveySchedule;
exports.removeSurveySchedule = removeSurveySchedule;
exports.scheduleJobs = scheduleJobs;