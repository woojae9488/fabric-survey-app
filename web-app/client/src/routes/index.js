import Vue from 'vue'
import Router from 'vue-router'

import Signin from '@/components/Signin'
import SurveyList from '@/components/SurveyList'
import StudentSignup from '@/components/StudentSignup'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/Signin',
            name: 'Signin',
            component: Signin
        },
        {
            path: '/SurveyList',
            name: 'SurveyList',
            component: SurveyList
        },
        {
            path: '/StudentSignup',
            name: 'StudentSignup',
            component: StudentSignup
        }
    ]
})