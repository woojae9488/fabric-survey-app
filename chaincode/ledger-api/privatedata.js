
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
        let json = JSON.parse(data);
        let objClass = supportedClasses[json.class];
        if (!objClass) {
            throw new Error(`Unknown class of ${json.class}`);
        }
        let object = new (objClass)(json);

        return object;
    }

    static deserializeClass(data, objClass) {
        let json = JSON.parse(data);
        let object = new (objClass)(json);
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