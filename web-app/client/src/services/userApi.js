import api from '@/services/api'

export default {
    async signup(role, id, password, name, departments) {
        departments = JSON.stringify(departments)
        return await api.instance().post(`/auth/users/${role}`, {
            id, password, name, departments: departments
        })
    },

    async changeInfo(role, id, newPassword, newName, newDepartments) {
        newDepartments = JSON.stringify(newDepartments)
        return await api.instance().put(`/auth/users/${role}/${id}`, {
            newPassword, newName, newDepartments
        })
    },

    async signout(role, id, password) {
        return await api.instance().delete(`/auth/users/${role}/${id}`, { password })
    },

    async signin(role, id, password) {
        return await api.instance().post(`/auth/tokens/${role}`, { id, password })
    },

    async certifyUser(role) {
        return await api.instance().get(`/auth/tokens/${role}`)
    },

    async reissueAccessToken(role) {
        return await api.instance().put(`/auth/tokens/${role}`)
    }
}