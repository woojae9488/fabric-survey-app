const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const nodeschedule = require('node-schedule');
const network = require('../network.js');

const adapter = new FileSync('./schedule.json');
const db = lowdb(adapter);
db.defaults({ schedules: [] }).write();
const scheduleJobs = {};

async function startSurvey(department, createdAt) {
    const networkObj = await network.connect(true, process.env.ADMIN);
    const contractRes = await network.invoke(networkObj, 'start', department, createdAt);

    const error = networkObj.error || contractRes.error;
    if (error) {
        console.log(error);
    } else {
        console.log(`Survey ${department}.${createdAt} start!!`);
    }
}

async function finishSurvey(department, createdAt, surveyInfoKey) {
    const networkObj = await network.connect(true, process.env.ADMIN);
    const contractRes = await network.invoke(networkObj, 'finish', department, createdAt);

    const error = networkObj.error || contractRes.error;
    if (error) {
        console.log(error);
        return;
    }
    console.log(`Survey ${department}.${createdAt} finish!!`);

    db.get('schedules')
        .remove({ key: surveyInfoKey })
        .write();
    console.log(`Survey ${department}.${createdAt} removed!!`);
}

function reserveSurveyDate(surveyInfo) {
    const { department, createdAt, key } = surveyInfo;
    const schedulejob = {};

    if (surveyInfo.startDate < Date.now()) {
        startSurvey(department, createdAt);
    } else {
        const startDate = new Date(parseInt(surveyInfo.startDate, 10));
        schedulejob.start = nodeschedule.scheduleJob(startDate, () => {
            startSurvey(department, createdAt);
        });
    }

    if (surveyInfo.finishDate < Date.now()) {
        finishSurvey(department, createdAt, key);
    } else {
        const finishDate = new Date(parseInt(surveyInfo.finishDate, 10));
        schedulejob.finish = nodeschedule.scheduleJob(finishDate, () => {
            finishSurvey(department, createdAt, key);
        });
    }

    console.log(`Reserve survey schedule successly: ${key}`);
    return schedulejob;
}

function cancelSurveySchedule(scheduleJob) {
    scheduleJob.start.cancel();
    scheduleJob.finish.cancel();
    console.log(`Cancel survey schedule successly`);
}

exports.initSurveySchedule = () => {
    const surveyInfos = db.get('schedules').value();

    surveyInfos.forEach(surveyInfo => {
        console.log(`Survey schedule : ${surveyInfo.key}`);
        const scheduleJob = reserveSurveyDate(surveyInfo);
        scheduleJobs[surveyInfo.key] = scheduleJob;
    });
    console.log('Finished initialize survey schedule.');
};

exports.addSurveySchedule = surveyInfoBuffer => {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Add survey schedule: ${surveyInfo.key}`);

    const scheduleJob = reserveSurveyDate(surveyInfo);
    scheduleJobs[surveyInfo.key] = scheduleJob;
    db.get('schedules')
        .push(surveyInfo)
        .write();
};

exports.updateSurveySchedule = surveyInfoBuffer => {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Update survey schedule: ${surveyInfo.key}`);

    const scheduleJob = scheduleJobs[surveyInfo.key];
    cancelSurveySchedule(scheduleJob);

    const newScheduleJob = reserveSurveyDate(surveyInfo);
    scheduleJobs[surveyInfo.key] = newScheduleJob;
    db.get('schedules')
        .find({ key: surveyInfo.key })
        .assign(surveyInfo)
        .write();
};

exports.removeSurveySchedule = surveyInfoBuffer => {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Remove survey schedule: ${surveyInfo.key}`);

    const scheduleJob = scheduleJobs[surveyInfo.key];
    cancelSurveySchedule(scheduleJob);
    delete scheduleJobs[surveyInfo.key];
    db.get('schedules')
        .remove({ key: surveyInfo.key })
        .write();
};

exports.scheduleJobs = scheduleJobs;
