
'use strict';

class PrivateData {

    constructor(dataClass, keyParts) {
        this.class = dataClass;
        keyParts.unshift(this.class);
        this.key = PrivateData.makeKey(keyParts);
    }

    getClass() {
        return this.class;
    }

    getKey() {
        return this.key;
    }

    getSplitKey() {
        return PrivateData.splitKey(this.key);
    }

    serialize() {
        return PrivateData.serialize(this);
    }

    static serialize(object) {
        return Buffer.from(JSON.stringify(object));
    }

    static deserialize(data, supportedClasses) {
        const json = JSON.parse(data);
        const objClass = supportedClasses[json.class];
        if (!objClass) {
            throw new Error(`Unknown class of ${json.class}`);
        }
        const object = new (objClass)(json);

        return object;
    }

    static makeKey(keyParts) {
        return keyParts.map(part => part.toString()).join(':');
    }

    static splitKey(key) {
        return key.split(':');
    }

}

module.exports = PrivateData;