'use strict';

const fs = require('fs');
const path = require('path');
const nodeschedule = require('node-schedule');
const network = require('../network.js');

const surveyInfosPath = path.join(__dirname, './schedule.json');
const scheduleJobs = {};

function addManagedSurvey(surveyInfo) {
    return new Promise((resolve, reject) => {
        try {
            let surveyInfosJSON = fs.readFileSync(surveyInfosPath, 'utf8');
            const surveyInfos = JSON.parse(surveyInfosJSON);

            surveyInfos.push(surveyInfo);
            surveyInfosJSON = JSON.stringify(surveyInfos);
            fs.writeFileSync(surveyInfosPath, surveyInfosJSON, 'utf8');
            console.log(`Add managed survey successly: ${surveyInfo.key}`);

            resolve();
        } catch (err) {
            console.error(`Fail to add managed survey: ${err}`);
            reject(err);
        }
    });
}

function updateManagedSurvey(newSurveyInfo) {
    return new Promise((resolve, reject) => {
        try {
            let surveyInfosJSON = fs.readFileSync(surveyInfosPath, 'utf8');
            const surveyInfos = JSON.parse(surveyInfosJSON);

            const surveyInfo = surveyInfos.find(data => data.key === newSurveyInfo.key);
            if (surveyInfo) {
                surveyInfos.splice(surveyInfos.indexOf(surveyInfo), 1);
            }
            surveyInfos.push(newSurveyInfo);

            surveyInfosJSON = JSON.stringify(surveyInfos);
            fs.writeFileSync(surveyInfosPath, surveyInfosJSON, 'utf8');
            console.log(`Update managed survey successly: ${surveyInfo.key}`);

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
            const surveyInfos = JSON.parse(surveyInfosJSON);

            const surveyInfo = surveyInfos.find(data => data.key === surveyInfoKey);
            if (surveyInfo) {
                surveyInfos.splice(surveyInfos.indexOf(surveyInfo), 1);
            }

            surveyInfosJSON = JSON.stringify(surveyInfos);
            fs.writeFileSync(surveyInfosPath, surveyInfosJSON, 'utf8');
            console.log(`Remove managed survey successly: ${surveyInfokey}`);

            resolve();
        } catch (err) {
            console.error(`Fail to remove managed survey: ${err}`);
            reject(err);
        }
    });
}

async function startSurvey(department, createdAt) {
    const networkObj = await network.connect(true, process.env.ADMIN);
    const contractRes = await network.invoke(networkObj, 'start', department, createdAt);
    if (networkObj.error || contractRes.error) {
        console.log(networkObj.error || contractRes.error);
    } else {
        console.log(`Survey ${department}.${createdAt} start!!`);
    }
}

async function finishSurvey(department, createdAt, surveyInfoKey) {
    const networkObj = await network.connect(true, process.env.ADMIN);
    const contractRes = await network.invoke(networkObj, 'finish', department, createdAt);
    if (networkObj.error || contractRes.error) {
        console.log(networkObj.error || contractRes.error);
        return;
    }
    console.log(`Survey ${department}.${createdAt} finish!!`);

    await removeManagedSurvey(surveyInfoKey);
    console.log(`Survey ${department}.${createdAt} removed!!`);
}

function reserveSurveyDate(surveyInfo) {
    const department = surveyInfo.department;
    const createdAt = surveyInfo.createdAt;
    const surveyInfoKey = surveyInfo.key;
    let startJob, finishJob;

    if (surveyInfo.startDate < Date.now()) {
        startSurvey(department, createdAt);
    } else {
        const startDate = new Date(parseInt(surveyInfo.startDate));
        startJob = nodeschedule.scheduleJob(startDate, startSurvey(department, createdAt));
    }

    if (surveyInfo.finishDate < Date.now()) {
        finishSurvey(department, createdAt, surveyInfoKey);
    } else {
        const finishDate = new Date(parseInt(surveyInfo.finishDate));
        finishJob = nodeschedule.scheduleJob(finishDate, finishSurvey(department, createdAt, surveyInfoKey));
    }

    console.log(`Reserve survey schedule successly: ${surveyInfoKey}`);
    return { start: startJob, finish: finishJob };
}

function cancelSurveySchedule(scheduleJob) {
    scheduleJob.start.cancel();
    scheduleJob.finish.cancel();
    console.log(`Cancel survey schedule successly`);
}

exports.initSurveySchedule = () => {
    console.log('Start to initialize survey schedule.');
    const surveyInfosJSON = fs.readFileSync(surveyInfosPath, 'utf8');
    const surveyInfos = JSON.parse(surveyInfosJSON);

    surveyInfos.forEach((surveyInfo) => {
        console.log(`Survey schedule : ${surveyInfo.key}`);
        const scheduleJob = reserveSurveyDate(surveyInfo);
        scheduleJobs[surveyInfo.key] = scheduleJob;
    });
}

exports.addSurveySchedule = (surveyInfoBuffer) => {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Add survey schedule: ${surveyInfo.key}`);

    const scheduleJob = reserveSurveyDate(surveyInfo);
    scheduleJobs[surveyInfo.key] = scheduleJob;
    await addManagedSurvey(surveyInfo);
}

exports.updateSurveySchedule = (surveyInfoBuffer) => {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Update survey schedule: ${surveyInfo.key}`);

    const scheduleJob = scheduleJobs[surveyInfo.key];
    cancelSurveySchedule(scheduleJob);

    const newScheduleJob = reserveSurveyDate(surveyInfo);
    scheduleJobs[surveyInfo.key] = newScheduleJob;
    await updateManagedSurvey(surveyInfo);
}

exports.removeSurveySchedule = (surveyInfoBuffer) => {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Remove survey schedule: ${surveyInfo.key}`);

    const scheduleJob = scheduleJobs[surveyInfo.key];
    cancelSurveySchedule(scheduleJob);
    delete scheduleJobs[surveyInfo.key];

    await removeManagedSurvey(surveyInfo.key);
}

exports.scheduleJobs = scheduleJobs;
