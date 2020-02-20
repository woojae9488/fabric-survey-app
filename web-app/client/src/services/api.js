import axios from 'axios'
import cookieJs from "js-cookie";

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

    getHeader(header) {
        return axios.defaults.headers.common[header];
    },

    setCookie(cookie, data) {
        cookieJs.set(cookie, data);
    },

    getCookie(cookie) {
        return cookieJs.get(cookie);
    },

    getCookieJSON(cookie) {
        return cookieJs.getJSON(cookie);
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
