import api from '@/services/api';

export default {
  async checkExistence(id) {
    const params = { role: api.getData('role') };
    return await api.instance().get(`/v1/fabric/auth/users/${id}`, { params });
  },

  async recognizeCard(imgData) {
    const params = { role: api.getData('role') };
    return await api.instance().post('/v1/card/student-card', { imgData }, { params });
  },

  async signup(id, password, name, department) {
    const params = { role: api.getData('role') };

    let departmentStr;
    if (params.role == 'manager') {
      departmentStr = JSON.stringify(department);
    } else if (params.role == 'student') {
      departmentStr = department;
    }

    return await api
      .instance()
      .post(
        '/v1/fabric/auth/users/',
        { id, password, name, department: departmentStr },
        { params },
      );
  },

  async changeInfo(id, newPassword, newName, newDepartment) {
    const params = { role: api.getData('role') };

    let newDepartmentStr;
    if (params.role == 'manager') {
      newDepartmentStr = JSON.stringify(newDepartment);
    } else if (params.role == 'student') {
      newDepartmentStr = department;
    }

    return await api
      .instance()
      .put(
        `/v1/fabric/auth/users/${id}`,
        { newPassword, newName, newDepartment: newDepartmentStr },
        { params },
      );
  },

  async signout(id, password) {
    const params = { role: api.getData('role'), password };
    return await api.instance().delete(`/v1/fabric/auth/users/${id}`, { params });
  },

  async signin(id, password) {
    const params = { role: api.getData('role') };
    return await api.instance().post('/v1/fabric/auth/token', { id, password }, { params });
  },

  async certifyUser() {
    const params = { role: api.getData('role') };
    return await api.instance().get('/v1/fabric/auth/token', { params });
  },

  async reissueAccessToken() {
    const params = { role: api.getData('role') };
    return await api.instance().put('/v1/fabric/auth/token', {}, { params });
  },
};
