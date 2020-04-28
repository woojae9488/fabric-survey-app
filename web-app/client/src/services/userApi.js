import api from '@/services/api';

export default {
  async checkExistence(role, id) {
    return await api.instance().get(`/auth/users/${role}/${id}`);
  },

  async signup(role, id, password, name, departments) {
    const departmentsJSON = JSON.stringify(departments);
    return await api.instance().post(`/auth/users/${role}`, {
      id,
      password,
      name,
      departments: departmentsJSON,
    });
  },

  async changeInfo(role, id, newPassword, newName, newDepartments) {
    const newDepartmentsJSON = JSON.stringify(newDepartments);
    return await api.instance().put(`/auth/users/${role}/${id}`, {
      newPassword,
      newName,
      newDepartments: newDepartmentsJSON,
    });
  },

  async signout(role, id, password) {
    return await api.instance().delete(`/auth/users/${role}/${id}`, { password });
  },

  async signin(role, id, password) {
    return await api.instance().post(`/auth/tokens/${role}`, { id, password });
  },

  async certifyUser(role) {
    return await api.instance().get(`/auth/tokens/${role}`);
  },

  async reissueAccessToken(role) {
    return await api.instance().put(`/auth/tokens/${role}`);
  },
};
