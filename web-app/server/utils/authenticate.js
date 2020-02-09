'use strict';

const jwt = require('jsonwebtoken');
const secretKey = "JNU_SURVEY@#!%"

exports.generateAccessToken = (information) => {
    return jwt.sign(information, secretKey, { expiresIn: '30m' });
};

exports.generateRefreshToken = (information) => {
    const { id, hashedPw } = information;
    return jwt.sign({ id }, secretKey + hashedPw, { expiresIn: '7d' });
};

exports.certifyAccessToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { reject(err); }
            else { resolve(decoded); }
        });
    });
};

exports.decodedRefreshToken = (token) => {
    return new Promise((resolve, reject) => {
        try {
            const decoded = jwt.decode(token);
            resolve(decoded);
        } catch (err) {
            reject(err);
        }
    });
};

exports.certifyRefreshToken = (token, hashedPw) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey + hashedPw, (err, decoded) => {
            if (err) { reject(err); }
            else { resolve(decoded); }
        });
    });
}