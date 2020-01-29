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

    makeBookmark(key){
        return this.ctx.stub.createCompositeKey('', State.splitKey(key));
    }

    /**
     * Add a state to the list. Creates a new state in worldstate with
     * appropriate composite key.  Note that state defines its own key.
     * State object is serialized before writing.
     */
    async addState(state) {
        let key = this.ctx.stub.createCompositeKey('', state.getSplitKey());
        let data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    /**
     * Get a state from the list using supplied keys. Form composite
     * keys to retrieve state from world state. State data is deserialized
     * into JSON object before being returned.
     */
    async getState(key) {
        let ledgerKey = this.ctx.stub.createCompositeKey('', State.splitKey(key));
        let data = await this.ctx.stub.getState(ledgerKey);
        if (data) {
            let state = State.deserialize(data, this.supportedClasses);
            return state;
        } else {
            return null;
        }
    }

    async getStatesByPartialKey(partialKey) {
        let datasIterator = await this.ctx.stub.getStateByPartialCompositeKey('', State.splitKey(partialKey));
        let states = await this.getAllResults(datasIterator);
        return states;
    }

    async getStatesByPartialKeyWithPagination(partialKey, pageSize, bookmark) {
        let ledgerBookmark = '';
        if (bookmark !== '') {
            ledgerBookmark = this.ctx.stub.createCompositeKey('', State.splitKey(bookmark));
        }

        const { iterator } = await this.ctx.stub.getStateByPartialCompositeKeyWithPagination('', State.splitKey(partialKey), pageSize, ledgerBookmark);
        let states = await this.getAllResults(iterator);
        return states;
    }

    async getStatesByRange(startKey, endKey) {
        let ledgerStartKey = this.ctx.stub.createCompositeKey('', State.splitKey(startKey));
        let ledgerEndKey = this.ctx.stub.createCompositeKey('', State.splitKey(endKey));

        let datasIterator = await this.ctx.stub.getStateByRange(ledgerStartKey, ledgerEndKey);
        let states = await this.getAllResults(datasIterator);
        return states;
    }

    async getStatesByRangeWithPagination(startKey, endKey, pageSize, bookmark) {
        let ledgerStartKey = this.ctx.stub.createCompositeKey('', State.splitKey(startKey));
        let ledgerEndKey = this.ctx.stub.createCompositeKey('', State.splitKey(endKey));
        let ledgerBookmark = '';
        if (bookmark !== '') {
            ledgerBookmark = this.ctx.stub.createCompositeKey('', State.splitKey(bookmark));
        }

        const { iterator } = await this.ctx.stub.getStateByRangeWithPagination(ledgerStartKey, ledgerEndKey, pageSize, ledgerBookmark);
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
        let key = this.ctx.stub.createCompositeKey('', state.getSplitKey());
        let data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    async deleteState(key) {
        let ledgerKey = this.ctx.stub.createCompositeKey('', State.splitKey(key));
        await this.ctx.stub.deleteState(ledgerKey);
    }

    async getAllResults(iterator) {
        let results = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
            let data = await iterator.next();
            if (data.value.value) {
                let state = data.value.value;
                let result = State.deserialize(state, this.supportedClasses);
                results.push(result);
            }

            if (data.done) {
                await iterator.close();
                return results;
            }
        }
    }

    /** Stores the class for future deserialization */
    use(stateClass) {
        this.supportedClasses[stateClass.getClass()] = stateClass;
    }

}

module.exports = StateList;