'use strict';

const network = require('../fabric/network.js');
const config = require('../fabric/config.js').connection;
const connectionType = config.connectionType;
const authenticateUtils = require('../utils/authenticate.js');

exports.studentSignup = async (information) => {
    const { id, password, name, departments } = information;

    let contractRes = await network.registerStudent(id, password, name, departments);
    if (contractRes.error) {
        return {
            status: contractRes.status,
            message: contractRes.error,
            data: {}
        };
    }

    return {
        status: 200,
        message: 'Success',
        data: {}
    };
};

exports.studentSignin = async (information) => {
    const { id, password } = information;

    let networkObj = await network.connect(connectionType.STUDENT, id);
    if (networkObj.error) {
        return {
            status: networkObj.status,
            message: networkObj.error,
            data: {}
        };
    }
    let contractRes = await network.query(networkObj, 'certifyStudent', id, password);
    if (contractRes.error) {
        return {
            status: contractRes.status,
            message: contractRes.error,
            data: {}
        };
    }

    let { hashedPw, name, departments } = JSON.parse(contractRes);
    let accessToken = authenticateUtils.generateAccessToken({ id, name, departments });
    let refreshToken = authenticateUtils.generateRefreshToken({ id, hashedPw });
    return {
        status: 200,
        message: 'Success',
        data: { id, name, departments, accessToken, refreshToken }
    };
};

exports.studentSignout = async (information) => {
    const { id, password } = information;

    let networkObj = await network.connect(connectionType.STUDENT, id);
    if (networkObj.error) {
        return {
            status: networkObj.status,
            message: networkObj.error,
            data: {}
        };
    }
    let contractRes = await network.query(networkObj, 'deleteStudent', id, password);
    if (contractRes.error) {
        return {
            status: contractRes.status,
            message: contractRes.error,
            data: {}
        };
    }

    return {
        status: 200,
        message: 'Success',
        data: {}
    };
}

exports.certifyStudent = async (token) => {
    try {
        let data = await authenticateUtils.certifyAccessToken(token);

        return {
            status: 200,
            message: 'Success',
            data
        };
    } catch (err) {
        return {
            status: 401,
            message: 'This token is invalid',
            data: {}
        };
    }
};

exports.studentReissueAccessToken = async (refreshToken) => {
    try {
        let decodedToken = await authenticateUtils.decodedRefreshToken(refreshToken);
        let id = decodedToken.id;

        let networkObj = await network.connect(connectionType.STUDENT, id);
        if (networkObj.error) {
            return {
                status: networkObj.status,
                message: networkObj.error,
                data: {}
            };
        }
        let contractRes = await network.query(networkObj, 'queryStudent', id);
        if (contractRes.error) {
            return {
                status: contractRes.status,
                message: contractRes.error,
                data: {}
            };
        }

        let { hashedPw, name, departments } = JSON.parse(contractRes);
        await authenticateUtils.certifyRefreshToken(refreshToken, hashedPw);
        let accessToken = authenticateUtils.generateAccessToken({ id, name, departments });

        return {
            status: 200,
            message: 'Success',
            data: { accessToken }
        };
    } catch (err) {
        return {
            status: 400,
            message: 'This token is invalid',
            data: {}
        };
    }
};

exports.managerSignup = async (information) => {
    const { id, password, departments } = information;

    let contractRes = await network.registerManager(id, password, departments);
    if (contractRes.error) {
        return {
            status: contractRes.status,
            message: contractRes.error,
            data: {}
        };
    }

    return {
        status: 200,
        message: 'Success',
        data: {}
    };
};

exports.managerSignin = async (information) => {
    const { id, password } = information;

    let networkObj = await network.connect(connectionType.MANAGER, id);
    if (networkObj.error) {
        return {
            status: networkObj.status,
            message: networkObj.error,
            data: {}
        };
    }
    let contractRes = await network.query(networkObj, 'certifyManager', id, password);
    if (contractRes.error) {
        return {
            status: contractRes.status,
            message: contractRes.error,
            data: {}
        };
    }

    let { hashedPw, name, departments } = JSON.parse(contractRes);
    let accessToken = authenticateUtils.generateAccessToken({ id, name, departments });
    let refreshToken = authenticateUtils.generateRefreshToken({ id, hashedPw });
    return {
        status: 200,
        message: 'Success',
        data: { id, name, departments, accessToken, refreshToken }
    };
};

exports.managerSignout = async (information) => {
    const { id, password } = information;

    let networkObj = await network.connect(connectionType.MANAGER, id);
    if (networkObj.error) {
        return {
            status: networkObj.status,
            message: networkObj.error,
            data: {}
        };
    }
    let contractRes = await network.query(networkObj, 'deleteManager', id, password);
    if (contractRes.error) {
        return {
            status: contractRes.status,
            message: contractRes.error,
            data: {}
        };
    }

    return {
        status: 200,
        message: 'Success',
        data: {}
    };
}

exports.certifyManager = async (token) => {
    try {
        let data = await authenticateUtils.certifyAccessToken(token);

        return {
            status: 200,
            message: 'Success',
            data
        };
    } catch (err) {
        return {
            status: 401,
            message: 'This token is invalid',
            data: {}
        };
    }
};

exports.managerReissueAccessToken = async (refreshToken) => {
    try {
        let decodedToken = await authenticateUtils.decodedRefreshToken(refreshToken);
        let id = decodedToken.id;

        let networkObj = await network.connect(connectionType.MANAGER, id);
        if (networkObj.error) {
            return {
                status: networkObj.status,
                message: networkObj.error,
                data: {}
            };
        }
        let contractRes = await network.query(networkObj, 'queryManager', id);
        if (contractRes.error) {
            return {
                status: contractRes.status,
                message: contractRes.error,
                data: {}
            };
        }

        let { hashedPw, name, departments } = JSON.parse(contractRes);
        await authenticateUtils.certifyRefreshToken(refreshToken, hashedPw);
        let accessToken = authenticateUtils.generateAccessToken({ id, name, departments });

        return {
            status: 200,
            message: 'Success',
            data: { accessToken }
        };
    } catch (err) {
        return {
            status: 400,
            message: 'This token is invalid',
            data: {}
        };
    }
};