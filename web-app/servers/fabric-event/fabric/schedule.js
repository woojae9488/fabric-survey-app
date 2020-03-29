const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const nodeschedule = require('node-schedule');
const network = require('./network.js');

const adapter = new FileSync('./schedule.json');
const db = lowdb(adapter);
db.defaults({ schedules: [] }).write();
const scheduleJobs = {};

async function startSurvey(department, createdAt) {
    const contractRes = await network.invoke('start', department, createdAt);

    if (contractRes.error) {
        console.log(contractRes.error);
    } else {
        console.log(`Survey ${department}.${createdAt} start!!`);
    }
}

async function finishSurvey(department, createdAt, surveyInfoKey) {
    const contractRes = await network.invoke('finish', department, createdAt);

    if (contractRes.error) {
        console.log(contractRes.error);
    } else {
        console.log(`Survey ${department}.${createdAt} finish!!`);
    }

    db.get('schedules')
        .remove({ key: surveyInfoKey })
        .write();
    console.log(`Survey ${department}.${createdAt} removed!!`);
}

function reserveSurveyDate(surveyInfo) {
    const { department, createdAt, key } = surveyInfo;
    const schedulejob = {};

    const startDate = new Date(parseInt(surveyInfo.startDate, 10));
    schedulejob.start = nodeschedule.scheduleJob(startDate, () => {
        startSurvey(department, createdAt);
    });
    if (!scheduleJobs.start) {
        startSurvey(department, createdAt);
    }

    const finishDate = new Date(parseInt(surveyInfo.finishDate, 10));
    schedulejob.finish = nodeschedule.scheduleJob(finishDate, () => {
        finishSurvey(department, createdAt, key);
    });
    if (!scheduleJobs.finish) {
        finishSurvey(department, createdAt, key);
    }

    console.log(`Reserve survey schedule successly: ${key}`);
    return schedulejob;
}

function cancelSurveySchedule(scheduleJob) {
    if (scheduleJob.start) {
        scheduleJob.start.cancel();
    }
    if (scheduleJob.finish) {
        scheduleJob.finish.cancel();
    }
    console.log('Cancel survey schedule successly');
}

exports.initSurveySchedule = () => {
    const surveyInfos = db.get('schedules').value();

    surveyInfos.forEach(surveyInfo => {
        console.log(`Survey schedule : ${surveyInfo.key}`);
        const scheduleJob = reserveSurveyDate(surveyInfo);
        if (scheduleJob.start || scheduleJob.finish) {
            scheduleJobs[surveyInfo.key] = scheduleJob;
        }
    });
    console.log('Finished initialize survey schedule.');
};

exports.addSurveySchedule = surveyInfoBuffer => {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Add survey schedule: ${surveyInfo.key}`);

    const scheduleJob = reserveSurveyDate(surveyInfo);
    if (scheduleJob.start || scheduleJob.finish) {
        scheduleJobs[surveyInfo.key] = scheduleJob;
        db.get('schedules')
            .push(surveyInfo)
            .write();
    }
};

exports.updateSurveySchedule = surveyInfoBuffer => {
    const surveyInfo = JSON.parse(surveyInfoBuffer);
    console.log(`Update survey schedule: ${surveyInfo.key}`);

    const scheduleJob = scheduleJobs[surveyInfo.key];
    cancelSurveySchedule(scheduleJob);

    const newScheduleJob = reserveSurveyDate(surveyInfo);
    if (scheduleJob.start || scheduleJob.finish) {
        scheduleJobs[surveyInfo.key] = newScheduleJob;
        db.get('schedules')
            .find({ key: surveyInfo.key })
            .assign(surveyInfo)
            .write();
    } else {
        delete scheduleJobs[surveyInfo.key];
        db.get('schedules')
            .remove({ key: surveyInfo.key })
            .write();
    }
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

exports.getScheduleJobs = () => {
    return scheduleJobs;
};
