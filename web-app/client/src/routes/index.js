import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/components/Login'
import SurveyList from '@/components/SurveyList'
import StudentSignup from '@/components/StudentSignup'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/Login',
            name: 'Login',
            component: Login
        },
        {
            path:'/SurveyList',
            name:'SurveyList',
            component: SurveyList
        },
        {
            path:'/StudentSignup',
            name:'StudentSignup',
            component: StudentSignup
        }
    ]
})