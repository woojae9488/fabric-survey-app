/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const State = require('./state.js');

/**
 * StateList provides a named virtual container for a set of ledger states.
 * Each state has a unique key which associates it with the container, rather
 * than the container containing a link to the state. This minimizes collisions
 * for parallel transactions on different states.
 */
class StateList {

    /**
     * Store Fabric context for subsequent API access, and name of list
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.supportedClasses = {};
    }

    /**
     * Add a state to the list. Creates a new state in worldstate with
     * appropriate composite key.  Note that state defines its own key.
     * State object is serialized before writing.
     */
    async addState(state) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(state.getSplitKey());
        let key = this.ctx.stub.createCompositeKey(objectType, attributes);
        let data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    /**
     * Get a state from the list using supplied keys. Form composite
     * keys to retrieve state from world state. State data is deserialized
     * into JSON object before being returned.
     */
    async getState(key) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(State.splitKey(key));
        let ledgerKey = this.ctx.stub.createCompositeKey(objectType, attributes);
        let data = await this.ctx.stub.getState(ledgerKey);
        if (data.toString()) {
            let state = State.deserialize(data, this.supportedClasses);
            return state;
        } else {
            return null;
        }
    }

    async getStatesByPartialKey(partialKey) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(State.splitKey(partialKey));
        let datasIterator = await this.ctx.stub.getStateByPartialCompositeKey(objectType, attributes);
        let states = await this.getAllResults(datasIterator);
        return states;
    }

    async getStatesByPartialKeyWithPagination(partialKey, pageSize, bookmark) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(State.splitKey(partialKey));
        const { iterator } = await this.ctx.stub.getStateByPartialCompositeKeyWithPagination(objectType, attributes, pageSize, bookmark);
        let states = await this.getAllResults(iterator);
        return states;
    }

    async getStatesByRange(startKey, endKey) {
        let startMaterial = this.getCompositeKeyMaterial(State.splitKey(startKey));
        let ledgerStartKey = this.ctx.stub.createCompositeKey(startMaterial.objectType, startMaterial.attributes);
        let endMaterial = this.getCompositeKeyMaterial(State.splitKey(endKey));
        let ledgerEndKey = this.ctx.stub.createCompositeKey(endMaterial.objectType, endMaterial.attributes);

        let datasIterator = await this.ctx.stub.getStateByRange(ledgerStartKey, ledgerEndKey);
        let states = await this.getAllResults(datasIterator);
        return states;
    }

    async getStatesByRangeWithPagination(startKey, endKey, pageSize, bookmark) {
        let startMaterial = this.getCompositeKeyMaterial(State.splitKey(startKey));
        let ledgerStartKey = this.ctx.stub.createCompositeKey(startMaterial.objectType, startMaterial.attributes);
        let endMaterial = this.getCompositeKeyMaterial(State.splitKey(endKey));
        let ledgerEndKey = this.ctx.stub.createCompositeKey(endMaterial.objectType, endMaterial.attributes);

        const { iterator } = await this.ctx.stub.getStateByRangeWithPagination(ledgerStartKey, ledgerEndKey, pageSize, bookmark);
        let states = await this.getAllResults(iterator);
        return states;
    }

    /**
     * Update a state in the list. Puts the new state in world state with
     * appropriate composite key.  Note that state defines its own key.
     * A state is serialized before writing. Logic is very similar to
     * addState() but kept separate becuase it is semantically distinct.
     */
    async updateState(state) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(state.getSplitKey());
        let key = this.ctx.stub.createCompositeKey(objectType, attributes);
        let data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    async deleteState(key) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(State.splitKey(key));
        let ledgerKey = this.ctx.stub.createCompositeKey(objectType, attributes);
        await this.ctx.stub.deleteState(ledgerKey);
    }

    async getAllResults(iterator) {
        let results = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
            let data = await iterator.next();
            if (data.value) {
                let state = data.value.value.toString('utf8');
                let result = State.deserialize(state, this.supportedClasses);
                results.push(result);
            }

            if (data.done) {
                await iterator.close();
                return results;
            }
        }
    }

    async setEvent(name, object) {
        let data = State.serialize(object);
        await this.ctx.stub.setEvent(name, data);
    }

    /** Stores the class for future deserialization */
    use(stateClass) {
        this.supportedClasses[stateClass.getClass()] = stateClass;
    }

    makeBookmark(key) {
        let { objectType, attributes } = this.getCompositeKeyMaterial(State.splitKey(key));
        return this.ctx.stub.createCompositeKey(objectType, attributes);
    }

    getCompositeKeyMaterial(splitKey) {
        let objectType = splitKey[0];
        let attributes = splitKey.slice(1);
        return { objectType, attributes };
    }

}

module.exports = StateList;