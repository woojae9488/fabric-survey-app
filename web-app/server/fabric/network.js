const fs = require('fs');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');

const studentConnPath = path.join(process.cwd(), process.env.STUDENT_CONN);
const studentConnJSON = fs.readFileSync(studentConnPath, 'utf8');
const studentConnection = JSON.parse(studentConnJSON);

const managerConnPath = path.join(process.cwd(), process.env.MANAGER_CONN);
const managerConnJSON = fs.readFileSync(managerConnPath, 'utf8');
const managerConnection = JSON.parse(managerConnJSON);

function getConnectionMaterial(isManager) {
    const connectionMaterial = {};

    if (isManager) {
        connectionMaterial.walletPath = path.join(process.cwd(), process.env.MANAGER_WALLET);
        connectionMaterial.connection = managerConnection;
        connectionMaterial.orgMSPID = process.env.MANAGER_MSP;
        connectionMaterial.caURL = process.env.MANAGER_CA_ADDR;
    } else {
        connectionMaterial.walletPath = path.join(process.cwd(), process.env.STUDENT_WALLET);
        connectionMaterial.connection = studentConnection;
        connectionMaterial.orgMSPID = process.env.STUDENT_MSP;
        connectionMaterial.caURL = process.env.STUDENT_CA_ADDR;
    }

    return connectionMaterial;
}

exports.connect = async (isManager, userID) => {
    const gateway = new Gateway();

    try {
        const { walletPath, connection } = getConnectionMaterial(isManager);

        const wallet = new FileSystemWallet(walletPath);
        const userExists = await wallet.exists(userID);
        if (!userExists) {
            console.error(`An identity for the user ${userID} does not exist in the wallet. Register ${userID} first`);
            return { status: 401, error: 'User identity does not exist in the wallet.' };
        }

        await gateway.connect(connection, {
            wallet,
            identity: userID,
            discovery: { enabled: true, asLocalhost: true },
        });
        const network = await gateway.getNetwork(process.env.CHANNEL);
        const contract = await network.getContract(process.env.CONTRACT);
        console.log('Connected to fabric network successly.');

        const networkObj = { gateway, network, contract };

        return networkObj;
    } catch (err) {
        console.error(`Fail to connect network: ${err}`);
        await gateway.disconnect();
        return { status: 500, error: err.toString() };
    }
};

exports.query = async (networkObj, ...funcAndArgs) => {
    try {
        console.log(`Query parameter: ${funcAndArgs}`);
        const funcAndArgsStrings = funcAndArgs.map(elem => String(elem));
        const response = await networkObj.contract.evaluateTransaction(...funcAndArgsStrings);
        console.log(`Transaction ${funcAndArgs} has been evaluated: ${response}`);

        return JSON.parse(response);
    } catch (err) {
        console.error(`Failed to evaluate transaction: ${err}`);
        return { status: 500, error: err.toString() };
    } finally {
        if (networkObj.gatway) {
            await networkObj.gateway.disconnect();
        }
    }
};

exports.invoke = async (networkObj, ...funcAndArgs) => {
    try {
        console.log(`Invoke parameter: ${funcAndArgs}`);
        const funcAndArgsStrings = funcAndArgs.map(elem => String(elem));
        const response = await networkObj.contract.submitTransaction(...funcAndArgsStrings);
        console.log(`Transaction ${funcAndArgs} has been submitted: ${response}`);

        return JSON.parse(response);
    } catch (err) {
        console.error(`Failed to submit transaction: ${err}`);
        return { status: 500, error: err.toString() };
    } finally {
        if (networkObj.gatway) {
            await networkObj.gateway.disconnect();
        }
    }
};

exports.enrollAdmin = async isManager => {
    try {
        const { walletPath, orgMSPID, caURL } = getConnectionMaterial(isManager);

        const wallet = new FileSystemWallet(walletPath);
        const adminExists = await wallet.exists(process.env.ADMIN);
        if (adminExists) {
            console.error('Admin user identity already exists in the wallet');
            return;
        }

        const ca = new FabricCAServices(caURL);
        const enrollment = await ca.enroll({
            enrollmentID: process.env.ADMIN,
            enrollmentSecret: process.env.ADMIN_SECRET,
        });
        const identity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(process.env.ADMIN, identity);
        console.log(`Successfully enrolled admin user and imported it into the wallet`);
    } catch (err) {
        console.error(`Failed to enroll admin user: ${err}`);
        process.exit(1);
    }
};

exports.registerUser = async (isManager, userID) => {
    const gateway = new Gateway();

    try {
        const { walletPath, connection, orgMSPID } = getConnectionMaterial(isManager);

        const wallet = new FileSystemWallet(walletPath);
        const userExists = await wallet.exists(userID);
        if (userExists) {
            console.error(`An identity for the user ${userID} already exists in the wallet`);
            return { status: 400, error: 'User identity already exists in the wallet.' };
        }

        const adminExists = await wallet.exists(process.env.ADMIN);
        if (!adminExists) {
            console.error(`An identity for the admin user ${process.env.ADMIN} does not exist in the wallet`);
            console.error('Enroll the admin before trying');
            return { status: 500, error: 'Admin user identity does not exist in the wallet.' };
        }

        await gateway.connect(connection, {
            wallet,
            identity: process.env.ADMIN,
            discovery: { enabled: true, asLocalhost: true },
        });
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        const secret = await ca.register({ affiliation: 'org1', enrollmentID: userID, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: userID, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(userID, userIdentity);

        console.log(`Successfully registered user. Use userID ${userID} to login`);
        return userIdentity;
    } catch (err) {
        console.error(`Failed to register user ${userID}: ${err}`);
        return { status: 500, error: err.toString() };
    } finally {
        await gateway.disconnect();
    }
};

exports.checkUserExists = async (isManager, userID) => {
    try {
        const { walletPath } = getConnectionMaterial(isManager);
        const wallet = new FileSystemWallet(walletPath);
        const userExists = await wallet.exists(userID);
        return userExists;
    } catch (err) {
        console.error(`Failed to check user exists ${userID}: ${err}`);
        return { status: 500, error: err.toString() };
    }
};
