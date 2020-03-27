const State = require('../ledger-api/State.js');

/**
 * Department class extends State class
 * Class will be used by application and smart contract to define a department
 * Element : organization, name, parent
 * Class Name Marked by DNS : org.jnu.department
 */
class Department extends State {
    constructor(obj) {
        super(Department.getClass(), [obj.organization, obj.name]);
        Object.assign(this, obj);
    }

    getOrganization() {
        return this.organization;
    }

    getName() {
        return this.name;
    }

    getParent() {
        return this.parent;
    }

    setParent(parent) {
        this.parent = parent;
    }

    static makeKey(keyParts) {
        keyParts.unshift(Department.getClass());
        return State.makeKey(keyParts);
    }

    static createInstance(organization, name, parent) {
        return new Department({ organization, name, parent });
    }

    static getClass() {
        return 'org.jnu.department';
    }
}

module.exports = Department;
