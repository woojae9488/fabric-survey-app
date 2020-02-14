
'use strict';

const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');

const config = require('./config.js').connection;
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
        caURL = config.managerCaAddress;
        affiliationName = "ManagerOrg";
    } else {
        walletPath = path.join(process.cwd(), config.studentWallet);
        connection = studentConnection;
        orgMSPID = config.studentMSPID;
        caURL = config.studentCaAddress;
        affiliationName = "StudentOrg";
    }

    return { walletPath, connection, orgMSPID, caURL, affiliationName };
}

async function connect(connType, userID) {
    const gateway = new Gateway();

    try {
        const { walletPath, connection } = getConnectionMaterial(connType);

        const wallet = new FileSystemWallet(walletPath);
        const userExists = await wallet.exists(userID);
        if (!userExists) {
            console.error(`An identity for the user ${userID} does not exist in the wallet. Register ${userID} first`);
            return { status: 401, error: 'User identity does not exist in the wallet.' };
        }

        await gateway.connect(connection, { wallet, identity: userID, discovery: config.gatewayDiscovery });
        const network = await gateway.getNetwork(config.channelName);
        const contract = await network.getContract(config.contractName);
        console.log('Connected to fabric network successly.');

        let networkObj = {
            gateway: gateway,
            network: network,
            contract: contract
        };

        return networkObj;
    } catch (err) {
        console.error(`Fail to connect network: ${err}`);
        await gateway.disconnect();
        return { status: 500, error: err };
    }
}

async function query(networkObj, ...funcAndArgs) {
    try {
        console.log(`Query parameter: ${funcAndArgs}`);

        let func = funcAndArgs.shift();
        let args = funcAndArgs;
        let response = await networkObj.contract.evaluateTransaction(func, args);
        console.log(`Transaction ${funcAndArgs} has been evaluated: ${response}`);

        return response;
    } catch (err) {
        console.error(`Failed to evaluate transaction: ${err}`);
        return { status: 500, error: err };
    } finally {
        await networkObj.gateway.disconnect();
    }
}

async function invoke(networkObj, ...funcAndArgs) {
    try {
        console.log(`Invoke parameter: ${funcAndArgs}`);

        let func = funcAndArgs.shift();
        let args = funcAndArgs;
        let response = await networkObj.contract.submitTransaction(func, args);
        console.log(`Transaction ${funcAndArgs} has been submitted: ${response}`);

        return response;
    } catch (err) {
        console.error(`Failed to submit transaction: ${err}`);
        return { status: 500, error: err };
    } finally {
        await networkObj.gateway.disconnect();
    }
}

async function enrollAdmin(connType) {
    try {
        const { walletPath, orgMSPID, caURL } = getConnectionMaterial(connType);

        const wallet = new FileSystemWallet(walletPath);
        const adminExists = await wallet.exists(config.appAdmin);
        if (adminExists) {
            console.error('Admin user identity already exists in the wallet');
            return;
        }

        const ca = new FabricCAServices(caURL);
        const enrollment = await ca.enroll({ enrollmentID: config.appAdmin, enrollmentSecret: config.appAdminSecret });
        const identity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(config.appAdmin, identity);
        console.log(`Successfully enrolled admin user and imported it into the wallet`);
    } catch (err) {
        console.error(`Failed to enroll admin user: ${err}`);
        process.exit(1);
    }
}

async function registerUser(connType, userID) {
    try {
        const { walletPath, connection, affiliationName, orgMSPID } = getConnectionMaterial(connType);

        const wallet = new FileSystemWallet(walletPath);
        const userExists = await wallet.exists(userID);
        if (userExists) {
            console.error(`An identity for the user ${userID} already exists in the wallet`);
            return { status: 400, error: 'User identity already exists in the wallet.' };
        }

        const adminExists = await wallet.exists(config.appAdmin);
        if (!adminExists) {
            console.error(`An identity for the admin user ${config.appAdmin} does not exist in the wallet`);
            console.error('Enroll the admin before trying');
            return { status: 500, error: 'Admin user identity does not exist in the wallet.' };
        }

        const gateway = new Gateway();
        await gateway.connect(connection, { wallet, identity: config.appAdmin, discovery: config.gatewayDiscovery });

        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        const secret = await ca.register({ affiliation: affiliationName, enrollmentID: userID, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: userID, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(userID, userIdentity);

        console.log(`Successfully registered user. Use userID ${userID} to login: ${userIdentity}`);
        return userIdentity;
    } catch (err) {
        console.error(`Failed to register user ${userID}: ${err}`);
        return { status: 500, error: err };
    } finally {
        await networkObj.gateway.disconnect();
    }
}

exports.connect = connect;
exports.query = query;
exports.invoke = invoke;
exports.enrollAdmin = enrollAdmin;
exports.registerUser = registerUser;