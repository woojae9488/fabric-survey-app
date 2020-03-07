/*
SPDX-License-Identifier: Apache-2.0
*/

const State = require('./State.js');

/**
 * StateList provides a named virtual container for a set of ledger states.
 * Each state has a unique key which associates it with the container, rather
 * than the container containing a link to the state. This minimizes collisions
 * for parallel transactions on different states.
 */
class StateList {
    constructor(ctx) {
        this.ctx = ctx;
        this.supportedClasses = {};
    }

    async addState(state) {
        const { objectType, attributes } = StateList.getCompositeKeyMaterial(state.getSplitKey());
        const key = this.ctx.stub.createCompositeKey(objectType, attributes);
        const data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    async getState(key) {
        const { objectType, attributes } = StateList.getCompositeKeyMaterial(State.splitKey(key));
        const ledgerKey = this.ctx.stub.createCompositeKey(objectType, attributes);
        const data = await this.ctx.stub.getState(ledgerKey);
        if (data.toString()) {
            const state = State.deserialize(data, this.supportedClasses);
            return state;
        }
        return null;
    }

    async getStatesByPartialKey(partialKey) {
        const { objectType, attributes } = StateList.getCompositeKeyMaterial(State.splitKey(partialKey));
        const datasIterator = await this.ctx.stub.getStateByPartialCompositeKey(objectType, attributes);
        const states = await this.getAllResults(datasIterator);
        return states;
    }

    async getStatesByPartialKeyWithPagination(partialKey, pageSize, bookmark) {
        const { objectType, attributes } = StateList.getCompositeKeyMaterial(State.splitKey(partialKey));
        const { iterator } = await this.ctx.stub.getStateByPartialCompositeKeyWithPagination(
            objectType,
            attributes,
            pageSize,
            bookmark,
        );
        const states = await this.getAllResults(iterator);
        return states;
    }

    async getStatesByRange(startKey, endKey) {
        const startMaterial = StateList.getCompositeKeyMaterial(State.splitKey(startKey));
        const ledgerStartKey = this.ctx.stub.createCompositeKey(startMaterial.objectType, startMaterial.attributes);
        const endMaterial = StateList.getCompositeKeyMaterial(State.splitKey(endKey));
        const ledgerEndKey = this.ctx.stub.createCompositeKey(endMaterial.objectType, endMaterial.attributes);

        const datasIterator = await this.ctx.stub.getStateByRange(ledgerStartKey, ledgerEndKey);
        const states = await this.getAllResults(datasIterator);
        return states;
    }

    async getStatesByRangeWithPagination(startKey, endKey, pageSize, bookmark) {
        const startMaterial = StateList.getCompositeKeyMaterial(State.splitKey(startKey));
        const ledgerStartKey = this.ctx.stub.createCompositeKey(startMaterial.objectType, startMaterial.attributes);
        const endMaterial = StateList.getCompositeKeyMaterial(State.splitKey(endKey));
        const ledgerEndKey = this.ctx.stub.createCompositeKey(endMaterial.objectType, endMaterial.attributes);

        const { iterator } = await this.ctx.stub.getStateByRangeWithPagination(
            ledgerStartKey,
            ledgerEndKey,
            pageSize,
            bookmark,
        );
        const states = await this.getAllResults(iterator);
        return states;
    }

    async updateState(state) {
        const { objectType, attributes } = StateList.getCompositeKeyMaterial(state.getSplitKey());
        const key = this.ctx.stub.createCompositeKey(objectType, attributes);
        const data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    async deleteState(key) {
        const { objectType, attributes } = StateList.getCompositeKeyMaterial(State.splitKey(key));
        const ledgerKey = this.ctx.stub.createCompositeKey(objectType, attributes);
        await this.ctx.stub.deleteState(ledgerKey);
    }

    async getAllResults(iterator) {
        const results = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const data = await iterator.next();
            if (data.value) {
                const state = data.value.value.toString('utf8');
                const result = State.deserialize(state, this.supportedClasses);
                results.push(result);
            }

            if (data.done) {
                await iterator.close();
                return results;
            }
        }
    }

    async setEvent(name, object) {
        const data = State.serialize(object);
        await this.ctx.stub.setEvent(name, data);
    }

    use(stateClass) {
        this.supportedClasses[stateClass.getClass()] = stateClass;
    }

    static makeBookmark(key) {
        const { objectType, attributes } = StateList.getCompositeKeyMaterial(State.splitKey(key));
        return this.ctx.stub.createCompositeKey(objectType, attributes);
    }

    static getCompositeKeyMaterial(splitKeys) {
        const objectType = splitKeys.shift();
        const attributes = splitKeys;
        return { objectType, attributes };
    }
}

module.exports = StateList;
