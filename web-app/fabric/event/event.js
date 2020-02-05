
'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const schedule = require('./schedule.js');

const path = require('path');
const fs = require('fs');
const util = require('util');

const configPath = path.join(process.cwd(), './fabric/config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

const connectionPath = path.join(process.cwd(), config.managerConnectionProfile);
const connectionJSON = fs.readFileSync(connectionPath, 'utf8');
const connection = JSON.parse(connectionJSON);

const walletPath = path.join(process.cwd(), config.managerWallet);
const wallet = new FileSystemWallet(walletPath);

async function activateContractEvent() {
    try {
        console.log(`connection: ${util.inspect(connection)}`);

        const gateway = new Gateway();
        await gateway.connect(connection, { wallet, identity: config.appAdmin, discovery: config.gatewayDiscovery });
        const network = await gateway.getNetwork(config.channelName);
        const contract = await network.getContract(config.contractName);
        console.log('Connected to surveynet.');

        const registerListener = await contract.addContractListener(config.registerListener, config.registerEvent,
            (err, event, blockNumber, transactionID, status) => {
                if (err) {
                    console.error(`Failed to add register listener: ${err}`);
                    return;
                }
                console.log(`Block Number: ${blockNumber}`);
                console.log(`Transaction ID: ${transactionID}`);
                console.log(`Status: ${status}`);

                schedule.addSurveySchedule(event.payload);
            }
        );

        const updateListener = await contract.addContractListener(config.updateListener, config.updateEvent,
            (err, event, blockNumber, transactionID, status) => {
                if (err) {
                    console.error(`Failed to add update listener: ${err}`);
                    return;
                }
                console.log(`Block Number: ${blockNumber}`);
                console.log(`Transaction ID: ${transactionID}`);
                console.log(`Status: ${status}`);

                schedule.updateSurveySchedule(event.payload);
            }
        );

        const removeListener = await contract.addContractListener(config.removeListener, config.removeEvent,
            (err, event, blockNumber, transactionID, status) => {
                if (err) {
                    console.error(`Failed to add remove listener: ${err}`);
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
        let response = {};
        response.error = err;

        return response;
    }
}

async function activateBlockEvent() {
    try {
        console.log(`connection: ${util.inspect(connection)}`);

        const gateway = new Gateway();
        await gateway.connect(connection, { wallet, identity: config.appAdmin, discovery: config.gatewayDiscovery });
        const network = await gateway.getNetwork(config.channelName);
        console.log('Connected to surveynet.');

        const listener = await network.addBlockListener(config.blockListener,
            (err, block) => {
                if (err) {
                    console.error(`Failed to add block listener: ${err}`);
                    return;
                }
                console.log(`Block: ${block}`);
            }
        );

        return listener;
    } catch (err) {
        console.error(`Error activate block event listener: ${err}`);
        let response = {};
        response.error = err;

        return response;
    }
}

async function activateCommitEvent(transactionName) {
    try {
        console.log(`connection: ${util.inspect(connection)}`);

        const gateway = new Gateway();
        await gateway.connect(connection, { wallet, identity: config.appAdmin, discovery: config.gatewayDiscovery });
        const network = await gateway.getNetwork(config.channelName);
        const contract = await network.getContract(config.contractName);
        console.log('Connected to surveynet.');

        const transaction = contract.createTransaction(transactionName);

        const listener = await transaction.addCommitListener(
            (err, transactionID, status, blockHeight) => {
                if (err) {
                    console.error(`Failed to add commit listener: ${err}`);
                    return;
                }
                if (status == 'VALID') {
                    console.log('transaction committed');
                    console.log(util.inspect(transactionID, { showHidden: false, depth: 5 }))
                    console.log(util.inspect(status, { showHidden: false, depth: 5 }))
                    console.log(util.inspect(blockHeight, { showHidden: false, depth: 5 }))
                    console.log('transaction committed end');
                } else {
                    console.log(`err transaction failed: ${status}`);
                }
            }
        );

        return listener;
    } catch (err) {
        console.error(`Error activate commit event listener: ${err}`);
        let response = {};
        response.error = err;

        return response;
    }
}

exports.activateContractEvent = activateContractEvent;
exports.activateBlockEvent = activateBlockEvent;
exports.activateCommitEvent = activateCommitEvent;