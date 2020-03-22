const StateList = require('../ledger-api/StateList.js');
const Department = require('./Department.js');

class DepartmentList extends StateList {
    constructor(ctx) {
        super(ctx);
        this.use(Department);
    }

    async addDepartment(department) {
        await this.addState(department);
    }

    async getDepartment(departmentKey) {
        return await this.getState(departmentKey);
    }

    async getDepartmentsByOrganization(organization) {
        const departmentsKey = Department.makeKey([organization]);
        const departments = await this.getStatesByPartialKey(departmentsKey);
        return departments;
    }

    async updateDepartment(department) {
        await this.updateState(department);
    }

    async deleteDepartment(departmentKey) {
        await this.deleteState(departmentKey);
    }

    async getDepartmentDependency(organization, name) {
        const dependency = [name];
        let targetKey = Department.makeKey([organization, name]);
        let targetParent = '';

        while (organization !== targetParent) {
            const target = await this.getState(targetKey);
            if (!target) {
                return null;
            }

            targetParent = target.getParent();
            dependency.unshift(targetParent);
            targetKey = Department.makeKey([organization, targetParent]);
        }

        return dependency;
    }

    async checkDepartmentsExist(organization, names) {
        const departments = [];

        const promises = names.map(async name => {
            const departmentKey = Department.makeKey([organization, name]);
            const department = await this.getDepartment(departmentKey);
            departments.push(department);
        });
        await Promise.all(promises);

        return departments.every(department => department);
    }
}

module.exports = DepartmentList;
