
'use strict';

const PrivateData = require('../ledger-api/privatedata.js');
const crypto = require('crypto');

class User extends PrivateData {

    constructor(obj) {
        super(User.getClass(), [obj.id]);
        Object.assign(this, obj);
    }

    getId() {
        return this.id;
    }

    getHashedPw() {
        return this.hashedPw;
    }

    getSalt() {
        return this.salt;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    setUpdatedAt(newTime) {
        this.updatedAt = newTime;
    }

    setHashedPw(newHashedPw) {
        this.hashedPw = newHashedPw;
    }

    setName(newName) {
        this.name = newName;
    }

    setDepartment(newDepartment) {
        this.department = newDepartment;
    }

    static makeSalt() {
        return Math.round(new Date().valueOf() * Math.random()) + '';
    }

    static encryptPassword(password, salt) {
        return crypto.createHmac('sha1', salt).update(password).digest('hex');
    }

    authenticate(password) {
        let hashedPw = User.encryptPassword(password, this.salt);
        return hashedPw === this.hashedPw;
    }

    static fromBuffer(buffer) {
        return User.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return PrivateData.deserializeClass(data, User);
    }

    static makeKey(keyParts) {
        keyParts.unshift(User.getClass());
        return PrivateData.makeKey(keyParts);
    }

    static createInstance(id, hashedPw, name, department, salt, createdAt) {
        return new User({ id, hashedPw, name, department, salt, createdAt });
    }

    static getClass() {
        return 'org.jnu.user';
    }
}

module.exports = User;
