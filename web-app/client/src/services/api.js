import axios from 'axios'

export default {
    instance() {
        return axios.create({
            baseURL: 'http://localhost:8090',
            timeout: 6000,
            headers: { 'Content-Type': 'application/json' }
        })
    },

    setHeader(header, data) {
        axios.defaults.headers.common[header] = data
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

    getResultData(apiResult) {
        return apiResult.data.data
    },

    getErrorMsg(apiError) {
        if (apiError.response) {
            return apiError.response.data.message
        } else {
            return apiError.toString()
        }
    }
}
