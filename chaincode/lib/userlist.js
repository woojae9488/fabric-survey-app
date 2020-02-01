
'use strict';

const PrivateDataList = require('../ledger-api/privatedatalist');

const User = require('./user.js');

class UserList extends PrivateDataList {

    constructor(ctx, collection) {
        super(ctx, collection);
        this.use(User);
    }

    async addUser(user) {
        await this.addPrivateData(user);
    }

    async getUser(userKey) {
        return this.getPrivateData(userKey);
    }

    async updateUser(user) {
        await this.updatePrivateData(user);
    }
}

module.exports = UserList;