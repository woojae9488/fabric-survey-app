
'use strict';

const PrivateData = require('../ledger-api/PrivateData.js');
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

    getName() {
        return this.name;
    }

    getDepartments() {
        return this.departments;
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

    setDepartments(newDepartments) {
        this.departments = newDepartments;
    }

    static makeSalt() {
        return Math.round(new Date().valueOf() * Math.random()) + '';
    }

    static encryptPassword(password, salt) {
        return crypto.createHmac('sha1', salt).update(password).digest('hex');
    }

    authenticate(password) {
        const hashedPw = User.encryptPassword(password, this.salt);
        return hashedPw === this.hashedPw;
    }

    static makeKey(keyParts) {
        keyParts.unshift(User.getClass());
        return PrivateData.makeKey(keyParts);
    }

    static createInstance(id, hashedPw, name, departments, salt, createdAt) {
        return new User({ id, hashedPw, name, departments, salt, createdAt });
    }

    static getClass() {
        return 'org.jnu.user';
    }
}

module.exports = User;
