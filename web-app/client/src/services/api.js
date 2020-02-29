import axios from 'axios';

export default {
  instance(url = 'http://localhost:8090') {
    return axios.create({
      baseURL: url,
      timeout: 7000,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  setHeader(header, data) {
    axios.defaults.headers.common[header] = data;
  },

  getHeader(header) {
    return axios.defaults.headers.common[header];
  },

  setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getData(key) {
    return JSON.parse(localStorage.getItem(key));
  },

  clearData(key = null) {
    if (key) {
      if (Array.isArray(key)) {
        key.forEach(k => localStorage.removeItem(k));
      } else {
        localStorage.removeItem(key);
      }
    } else {
      localStorage.clear();
    }
  },

  getResultData(apiResult) {
    return apiResult.data.data;
  },

  getErrorMsg(apiError) {
    if (apiError.response) {
      return apiError.response.data.message;
    }
    return apiError.toString();
  },
};
