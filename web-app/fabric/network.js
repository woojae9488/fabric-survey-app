
'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');

const path = require('path');
const fs = require('fs');
const util = require('util');

const configPath = path.join(process.cwd(), './fabric/config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);
const connectionType = config.connectionType;

const studentConnPath = path.join(process.cwd(), config.studentConnectionProfile);
const studentConnJSON = fs.readFileSync(studentConnPath, 'utf8');
const studentConnection = JSON.parse(studentConnJSON);

const managerConnPath = path.join(process.cwd(), config.managerConnectionProfile);
const managerConnJSON = fs.readFileSync(managerConnPath, 'utf8');
const managerConnection = JSON.parse(managerConnJSON);

function getConnectionMaterial(connType) {
    let walletPath, connection, orgMSPID, caURL, affiliationName;

    if (connType == connectionType.MANAGER) {
        walletPath = path.join(process.cwd(), config.managerWallet);
        connection = managerConnection;
        orgMSPID = config.managerMSPID;
        caURL = config.managerCAAddress;
        affiliationName = "ManagerOrg";
    } else {
        walletPath = path.join(process.cwd(), config.studentWallet);
        connection = studentConnection;
        orgMSPID = config.studentMSPID;
        caURL = config.studentCAAddress;
        affiliationName = "StudentOrg";
    }

    return { walletPath, connection, orgMSPID, caURL, affiliationName };
}

async function connect(connType, userID) {
    try {
        const { walletPath, connection } = getConnectionMaterial(connType);

        const wallet = new FileSystemWallet(walletPath);
        console.log(`userID: ${userID}`);
        console.log(`wallet: ${util.inspect(wallet)}`);
        console.log(`connection: ${util.inspect(connection)}`);

        const userExists = await wallet.exists(userID);
        if (!userExists) {
            console.log(`An identity for the user ${userID} does not exist in the wallet`);
            console.log('Run the registerUser.js application before retrying');

            let response = {};
            response.error = `An identity for the user ${userID} does not exist in the wallet. Register ${userID} first`;
            return response;
        }

        const gateway = new Gateway();
        await gateway.connect(connection, { wallet, identity: userID, discovery: config.gatewayDiscovery });

        const network = await gateway.getNetwork(config.channelName);
        const contract = await network.getContract(config.contractName);
        console.log('Connected to surveynet. ');

        let networkObj = {
            gateway: gateway,
            network: network,
            contract: contract
        };

        return networkObj;
    } catch (err) {
        console.error(`Error processing transaction: ${err}`);
        let response = {};
        response.error = err;

        return response;
    }
}

async function query(networkObj, ...funcAndArgs) {
    try {
        console.log(`Query parameter: ${funcAndArgs}`);
        console.log(util.inspect(networkObj));

        let contract = networkObj.contract;
        let response = await contract.evaluateTransaction.apply(contract, funcAndArgs);
        console.log(response);
        console.log(`Transaction ${funcAndArgs} has been evaluated`);

        return response;
    } catch (err) {
        console.error(`Failed to evaluate transaction: ${err}`);
        let response = {};
        response.error = err;

        return response;
    } finally {
        await networkObj.gateway.disconnect();
    }
}

async function invoke(networkObj, ...funcAndArgs) {
    try {
        console.log(`Invoke parameter: ${funcAndArgs}`);
        console.log(util.inspect(networkObj));

        let contract = networkObj.contract;
        let response = await contract.submitTransaction.apply(contract, funcAndArgs);
        console.log(response);
        console.log(`Transaction ${funcAndArgs} has been submitted`);

        return response;
    } catch (err) {
        console.error(`Failed to submit transaction: ${err}`);
        let response = {};
        response.error = err;

        return response;
    } finally {
        await networkObj.gateway.disconnect();
    }
}

async function enrollAdmin(connType) {
    try {
        const { walletPath, orgMSPID, caURL } = getConnectionMaterial(connType);

        const wallet = new FileSystemWallet(walletPath);
        console.log(`wallet: ${util.inspect(wallet)}`);
        const ca = new FabricCAServices(caURL);

        const adminExists = await wallet.exists(config.appAdmin);
        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Does CA not need to register admin?
        const enrollment = await ca.enroll({ enrollmentID: config.appAdmin, enrollmentSecret: config.appAdminSecret });
        const identity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        wallet.import(config.appAdmin, identity);
        console.log(`msg: Successfully enrolled admin user ${config.appAdmin} and imported it into the wallet`);
    } catch (err) {
        console.error(`Failed to enroll admin user ${config.appAdmin}: ${err}`);
        process.exit(1);
    }
}

async function registerUser(connType, userID) {
    try {
        const { walletPath, connection, affiliationName, orgMSPID } = getConnectionMaterial(connType);

        const wallet = new FileSystemWallet(walletPath);
        console.log(`wallet: ${util.inspect(wallet)}`);
        console.log(wallet);

        const userExists = await wallet.exists(userID);
        if (userExists) {
            let response = {};
            console.log(`An identity for the user ${userID} already exists in the wallet`);
            response.error = `Error! An identity for the user ${userID} already exists in the wallet.`;
            return response;
        }

        const adminExists = await wallet.exists(config.appAdmin);
        if (!adminExists) {
            console.log(`An identity for the admin user ${config.appAdmin} does not exist in the wallet`);
            console.log('Enroll the admin before trying');
            await enrollAdmin(connType);
        }

        const gateway = new Gateway();
        await gateway.connect(connection, { wallet, identity: config.appAdmin, discovery: config.gatewayDiscovery });

        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();
        console.log(`AdminIdentity: ${adminIdentity}`);

        const secret = await ca.register({ affiliation: affiliationName, enrollmentID: userID, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: userID, enrollmentSecret: secret });
        const userIdentity = await X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(userID, userIdentity);

        console.log(`Successfully registered user. Use userID ${userID} to login.`);
        let response = `Successfully registered user. Use userID ${userID} to login.`;

        return response;
    } catch (err) {
        console.error(`Failed to register user ${userID}: ${err}`);
        let response = {};
        response.error = err;

        return response;
    } finally {
        await networkObj.gateway.disconnect();
    }
}

async function registerStudent(userID, password, name, department) {
    console.log(`student id: ${userID}`);

    if (!userID || !password || !name || !department) {
        let response = {};
        response.error = 'Error! You need to fill all fields before you can register!';
        return response;
    }

    try {
        let certResponse = await registerUser(connectionType.STUDENT, userID);
        if (certResponse.error) {
            let response = {};
            response.error = certResponse.error;

            return response;
        }

        let networkObj = await connect(connectionType.STUDENT, userID);
        console.log(util.inspect(networkObj));

        let response = await networkObj.contract.submitTransaction('registerStudent', userID, password, name, department);
        console.log(response);
        console.log(`Register user ${userID} transaction has been submitted`);

        return response;
    } catch (err) {
        console.error(`Failed to register student ${userID}: ${err}`);
        let response = {};
        response.error = err;

        return response;
    } finally {
        await networkObj.gateway.disconnect();
    }
}

async function registerManager(userID, password, department) {
    console.log(`manager id: ${userID}`);

    if (!userID || !password || !department) {
        let response = {};
        response.error = 'Error! You need to fill all fields before you can register!';
        return response;
    }

    try {
        let certResponse = await registerUser(connectionType.MANAGER, userID);
        if (certResponse.error) {
            let response = {};
            response.error = certResponse.error;

            return response;
        }

        let networkObj = await connect(connectionType.MANAGER, userID);
        console.log(util.inspect(networkObj));

        let response = await networkObj.contract.submitTransaction('registerManager', userID, password, department);
        console.log(response);
        console.log(`Register user ${userID} transaction has been submitted`);

        return response;
    } catch (err) {
        console.error(`Failed to register manager ${userID}: ${err}`);
        let response = {};
        response.error = err;

        return response;
    } finally {
        await networkObj.gateway.disconnect();
    }
}

exports.connect = connect;
exports.query = query;
exports.invoke = invoke;
exports.enrollAdmin = enrollAdmin;
exports.registerUser = registerUser;
exports.registerStudent = registerStudent;
exports.registerManager = registerManager;

exports.config = config;
exports.connectionType = connectionType;
