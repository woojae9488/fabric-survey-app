
'use strict';

const PrivateData = require('./PrivateData.js');

class PrivateDataList {

    constructor(ctx, collection) {
        this.ctx = ctx;
        this.collection = collection;
        this.supportedClasses = {};
    }

    async addPrivateData(privateData) {
        const { objectType, attributes } = PrivateDataList.getCompositeKeyMaterial(privateData.getSplitKey());
        const key = this.ctx.stub.createCompositeKey(objectType, attributes);
        const data = PrivateData.serialize(privateData);
        await this.ctx.stub.putPrivateData(this.collection, key, data);
    }

    async getPrivateData(key) {
        const { objectType, attributes } = PrivateDataList.getCompositeKeyMaterial(PrivateData.splitKey(key));
        const ledgerKey = this.ctx.stub.createCompositeKey(objectType, attributes);
        const data = await this.ctx.stub.getPrivateData(this.collection, ledgerKey);
        if (data.toString()) {
            const privateData = PrivateData.deserialize(data, this.supportedClasses);
            return privateData;
        } else {
            return null;
        }
    }

    async updatePrivateData(privateData) {
        let { objectType, attributes } = PrivateDataList.getCompositeKeyMaterial(privateData.getSplitKey());
        let key = this.ctx.stub.createCompositeKey(objectType, attributes);
        let data = PrivateData.serialize(privateData);
        await this.ctx.stub.putPrivateData(this.collection, key, data);
    }

    async deletePrivateData(key) {
        let { objectType, attributes } = PrivateDataList.getCompositeKeyMaterial(PrivateData.splitKey(key));
        let ledgerKey = this.ctx.stub.createCompositeKey(objectType, attributes);
        await this.ctx.stub.deletePrivateData(this.collection, ledgerKey);
    }

    use(privateDataClass) {
        this.supportedClasses[privateDataClass.getClass()] = privateDataClass;
    }

    static getCompositeKeyMaterial(splitKey) {
        const objectType = splitKey.shift();
        const attributes = splitKey;
        return { objectType, attributes };
    }
}

module.exports = PrivateDataList;