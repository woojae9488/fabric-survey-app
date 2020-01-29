
'use strict';

const State = require('../ledger-api/state.js');

/**
 * ReplyResult class extends State class
 * Class will be used by application and smart contract to define a survey reply result
 * Element : replyKey, resultNum, answers
 * Class Name Marked by DNS : org.jnu.replyresult
 */
class ReplyResult extends State {

    constructor(obj) {
        super(ReplyResult.getClass(), [obj.replyKey, obj.resultNum]);
        Object.assign(this, obj);
    }

    static fromBuffer(buffer) {
        return ReplyResult.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data) {
        return State.deserializeClass(data, ReplyResult);
    }

    static makeKey(keyParts) {
        keyParts.unshift(ReplyResult.getClass());
        return State.makeKey(keyParts);
    }

    static createInstance(replyKey, resultNum, answers) {
        return new ReplyResult({ replyKey, resultNum, answers });
    }

    static getClass() {
        return 'org.jnu.replyresult';
    }
}

module.exports = ReplyResult;
