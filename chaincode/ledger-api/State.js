/*
SPDX-License-Identifier: Apache-2.0
*/

/**
 * State class. States have a class, unique key, and a lifecycle current state
 * the current state is determined by the specific subclass
 */
class State {
    constructor(stateClass, keyParts) {
        this.class = stateClass;
        keyParts.unshift(this.class);
        this.key = State.makeKey(keyParts);
    }

    getClass() {
        return this.class;
    }

    getKey() {
        return this.key;
    }

    getSplitKey() {
        return State.splitKey(this.key);
    }

    serialize() {
        return State.serialize(this);
    }

    static serialize(object) {
        return Buffer.from(JSON.stringify(object));
    }

    static deserialize(data, supportedClasses) {
        const json = JSON.parse(data);
        const ObjClass = supportedClasses[json.class];
        if (!ObjClass) {
            throw new Error(`Unknown class of ${json.class}`);
        }
        const object = new ObjClass(json);

        return object;
    }

    static makeKey(keyParts) {
        return keyParts.map(part => String(part)).join(':');
    }

    static splitKey(key) {
        return key.split(':');
    }
}

module.exports = State;
