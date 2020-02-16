import axios from 'axios'

export default {
    instance() {
        return axios.create({
            baseURL: 'http://localhost:8090',
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
        })
    },

    setHeader(header, data) {
        axios.defaults.headers.common[header] = data
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
