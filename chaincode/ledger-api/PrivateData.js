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

module.exports = PrivateData;
