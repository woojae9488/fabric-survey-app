'use strict';

const PrivateData = require('./privatedata.js');

class PrivateDataList {

    constructor(ctx, collection) {
        this.ctx = ctx;
        this.collection = collection;
        this.supportedClasses = {};
    }

    async addPrivateData(privateData) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(privateData.getSplitKey());
        let key = this.ctx.stub.createCompositeKey(objectType, attributes);
        let data = PrivateData.serialize(privateData);
        await this.ctx.stub.putPrivateData(this.collection, key, data);
    }

    async getPrivateData(key) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(PrivateData.splitKey(key));
        let ledgerKey = this.ctx.stub.createCompositeKey(objectType, attributes);
        let data = await this.ctx.stub.getPrivateData(this.collection, ledgerKey);
        if (data.toString()) {
            let privateData = PrivateData.deserialize(data, this.supportedClasses);
            return privateData;
        } else {
            return null;
        }
    }

    async updatePrivateData(privateData) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(privateData.getSplitKey());
        let key = this.ctx.stub.createCompositeKey(objectType, attributes);
        let data = PrivateData.serialize(privateData);
        await this.ctx.stub.putPrivateData(this.collection, key, data);
    }

    async deletePrivateData(key) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(PrivateData.splitKey(key));
        let ledgerKey = this.ctx.stub.createCompositeKey(objectType, attributes);
        await this.ctx.stub.deletePrivateData(this.collection, ledgerKey);
    }

    use(privateDataClass) {
        this.supportedClasses[privateDataClass.getClass()] = privateDataClass;
    }

    getCompositeKeyMaterial(splitKey) {
        let objectType = splitKey[0];
        let attributes = splitKey.slice(1);
        return { objectType, attributes };
    }
}

module.exports = PrivateDataList;