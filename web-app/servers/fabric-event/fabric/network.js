const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const schedule = require('./schedule.js');

const wallet = new FileSystemWallet('./identity/wallet');
const ccpPath = path.join(__dirname, './connection-profile.json');
const ccpFile = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpFile);
const ccpOptions = {
    wallet,
    identity: process.env.ADMIN,
    discovery: { enabled: true, asLocalhost: Boolean(process.env.AS_LOCALHOST) },
};

exports.enrollAdmin = async () => {
    try {
        const adminExists = await wallet.exists(process.env.ADMIN);
        if (adminExists) {
            console.error('Admin user identity already exists in the wallet');
            return;
        }

        const ca = new FabricCAServices(process.env.ADDR_CA);
        const enrollment = await ca.enroll({
            enrollmentID: process.env.ADMIN,
            enrollmentSecret: process.env.ADMIN_SECRET,
        });
        const identity = X509WalletMixin.createIdentity(
            process.env.MSP,
            enrollment.certificate,
            enrollment.key.toBytes(),
        );
        await wallet.import(process.env.ADMIN, identity);
        console.log(`Successfully enrolled admin user and imported it into the wallet`);
    } catch (err) {
        console.error(`Failed to enroll admin user: ${err}`);
        process.exit(1);
    }
};

exports.invoke = async (...funcAndArgs) => {
    const gateway = new Gateway();

    try {
        await gateway.connect(ccp, ccpOptions);
        const network = await gateway.getNetwork(process.env.CHANNEL);
        const contract = await network.getContract(process.env.CONTRACT);
        console.log('Connected to fabric network successly.');

        console.log(`Invoke parameter: ${funcAndArgs}`);
        const funcAndArgsStrings = funcAndArgs.map(elem => String(elem));
        const response = await contract.submitTransaction(...funcAndArgsStrings);
        console.log(`Transaction ${funcAndArgs} has been submitted: ${response}`);

        return JSON.parse(response);
    } catch (err) {
        console.error(`Failed to submit transaction: ${err}`);
        return { status: 500, error: err.toString() };
    } finally {
        await gateway.disconnect();
    }
};

exports.handlingPastEvents = () => {
    schedule.initSurveySchedule();
};

exports.activateContractEvent = async () => {
    try {
        const gateway = new Gateway();
        await gateway.connect(ccp, ccpOptions);
        const network = await gateway.getNetwork(process.env.CHANNEL);
        const contract = await network.getContract(process.env.CONTRACT);

        const logContractEvent = (err, event, blockNumber, transactionID, status) => {
            if (err) {
                console.error(`Failed to listen contract event: ${err}`);
                return;
            }
            console.log(`Block Number: ${blockNumber}`);
            console.log(`Transaction ID: ${transactionID}`);
            console.log(`Status: ${status}`);

            schedule.addSurveySchedule(event.payload);
        };

        const registerListener = await contract.addContractListener(
            'registerEventListener',
            'surveyRegisterEvent',
            logContractEvent,
        );

        const updateListener = await contract.addContractListener(
            'updateEventListener',
            'surveyUpdateEvent',
            logContractEvent,
        );

        const removeListener = await contract.addContractListener(
            'removeEventListener',
            'surveyRemoveEvent',
            logContractEvent,
        );

        console.log('Activated contract event listener successly.');
        return { registerListener, updateListener, removeListener };
    } catch (err) {
        console.error(`Error activate contract event listener: ${err}`);
        return { error: err.toString() };
    }
};

exports.activateBlockEvent = async () => {
    try {
        const gateway = new Gateway();
        await gateway.connect(ccp, ccpOptions);
        const network = await gateway.getNetwork(process.env.CHANNEL);

        const listener = await network.addBlockListener('surveynetBlockListener', (err, block) => {
            if (err) {
                console.error(`Failed to listen block event: ${err}`);
                return;
            }
            console.log(`Block: ${block}`);
        });

        console.log('Activated block event listener successly.');
        return listener;
    } catch (err) {
        console.error(`Error activate block event listener: ${err}`);
        return { error: err.toString() };
    }
};
