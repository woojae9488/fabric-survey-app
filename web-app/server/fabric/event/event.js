
'use strict';

const fs = require('fs');
const path = require('path');
const { FileSystemWallet, Gateway } = require('fabric-network');

const schedule = require('./schedule.js');
const config = require('../config.js').connection;
const eventCfg = require('../config.js').event;

const connectionPath = path.join(process.cwd(), config.managerConnectionProfile);
const connectionJSON = fs.readFileSync(connectionPath, 'utf8');
const connection = JSON.parse(connectionJSON);

const walletPath = path.join(process.cwd(), config.managerWallet);
const wallet = new FileSystemWallet(walletPath);

function handlingPastEvents() {
    schedule.initSurveySchedule();
}

async function activateContractEvent() {
    try {
        const gateway = new Gateway();
        await gateway.connect(connection, { wallet, identity: config.appAdmin, discovery: config.gatewayDiscovery });
        const network = await gateway.getNetwork(config.channelName);
        const contract = await network.getContract(config.contractName);
        console.log('Connected to surveynet successly.');

        const registerListener = await contract.addContractListener(eventCfg.registerListener, eventCfg.registerEvent,
            (err, event, blockNumber, transactionID, status) => {
                if (err) {
                    console.error(`Failed to listen register event: ${err}`);
                    return;
                }
                console.log(`Block Number: ${blockNumber}`);
                console.log(`Transaction ID: ${transactionID}`);
                console.log(`Status: ${status}`);

                schedule.addSurveySchedule(event.payload);
            }
        );

        const updateListener = await contract.addContractListener(eventCfg.updateListener, eventCfg.updateEvent,
            (err, event, blockNumber, transactionID, status) => {
                if (err) {
                    console.error(`Failed to listen update event: ${err}`);
                    return;
                }
                console.log(`Block Number: ${blockNumber}`);
                console.log(`Transaction ID: ${transactionID}`);
                console.log(`Status: ${status}`);

                schedule.updateSurveySchedule(event.payload);
            }
        );

        const removeListener = await contract.addContractListener(eventCfg.removeListener, eventCfg.removeEvent,
            (err, event, blockNumber, transactionID, status) => {
                if (err) {
                    console.error(`Failed to listen remove event: ${err}`);
                    return;
                }
                console.log(`Block Number: ${blockNumber}`);
                console.log(`Transaction ID: ${transactionID}`);
                console.log(`Status: ${status}`);

                schedule.removeSurveySchedule(event.payload);
            }
        );

        return { registerListener, updateListener, removeListener };
    } catch (err) {
        console.error(`Error activate contract event listener: ${err}`);
        return { error: err.toString() };
    }
}

async function activateBlockEvent() {
    try {
        const gateway = new Gateway();
        await gateway.connect(connection, { wallet, identity: config.appAdmin, discovery: config.gatewayDiscovery });
        const network = await gateway.getNetwork(config.channelName);
        console.log('Connected to surveynet successly.');

        const listener = await network.addBlockListener(eventCfg.blockListener,
            (err, block) => {
                if (err) {
                    console.error(`Failed to listen block event: ${err}`);
                    return;
                }
                console.log(`Block: ${block}`);
            }
        );

        return listener;
    } catch (err) {
        console.error(`Error activate block event listener: ${err}`);
        return { error: err.toString() };
    }
}

async function activateCommitEvent(transactionName) {
    try {
        const gateway = new Gateway();
        await gateway.connect(connection, { wallet, identity: config.appAdmin, discovery: config.gatewayDiscovery });
        const network = await gateway.getNetwork(config.channelName);
        const contract = await network.getContract(config.contractName);
        console.log('Connected to surveynet successly.');

        const transaction = contract.createTransaction(transactionName);
        const listener = await transaction.addCommitListener(
            (err, transactionID, status, blockHeight) => {
                if (err) {
                    console.error(`Failed to listen commit event: ${err}`);
                    return;
                }
                if (status === 'VALID') {
                    console.log('transaction committed');
                    console.log(transactionID);
                    console.log(status);
                    console.log(blockHeight);
                    console.log('transaction committed end');
                } else {
                    console.log(`err transaction failed: ${status}`);
                }
            }
        );

        return listener;
    } catch (err) {
        console.error(`Error activate commit event listener: ${err}`);
        return { error: err.toString() };
    }
}

exports.handlingPastEvents = handlingPastEvents;
exports.activateContractEvent = activateContractEvent;
exports.activateBlockEvent = activateBlockEvent;
exports.activateCommitEvent = activateCommitEvent;