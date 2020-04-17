import api from '@/services/api';

export default {
  async queryAll() {
    const params = { role: api.getData('role') };
    return await api.instance().get('/v1/fabric/state/departments', { params });
  },
};
