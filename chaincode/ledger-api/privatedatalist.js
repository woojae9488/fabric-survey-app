'use strict';

const PrivateData = require('./privatedata.js');

class PrivateDataList {

    constructor(ctx, collection) {
        this.ctx = ctx;
        this.collection = collection;
        this.supportedClasses = {};
    }

    async addPrivateData(privateData) {
        let key = this.ctx.stub.createCompositeKey('', privateData.getSplitKey());
        let data = PrivateData.serialize(privateData);
        await this.ctx.stub.putPrivateData(this.collection, key, data);
    }

    async getPrivateData(key) {
        let ledgerKey = this.ctx.stub.createCompositeKey('', PrivateData.splitKey(key));
        let data = await this.ctx.stub.getPrivateData(this.collection, ledgerKey);
        if (data) {
            let privateData = PrivateData.deserialize(data, this.supportedClasses);
            return privateData;
        } else {
            return null;
        }
    }

    async updatePrivateData(privateData) {
        let key = this.ctx.stub.createCompositeKey('', privateData.getSplitKey());
        let data = PrivateData.serialize(privateData);
        await this.ctx.stub.putPrivateData(this.collection, key, data);
    }

    async deletePrivateData(key) {
        let ledgerKey = this.ctx.stub.createCompositeKey('', PrivateData.splitKey(key));
        await this.ctx.stub.deletePrivateData(this.collection, ledgerKey);
    }

    use(stateClass) {
        this.supportedClasses[stateClass.getClass()] = stateClass;
    }

}

module.exports = PrivateDataList;