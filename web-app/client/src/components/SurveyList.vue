<template>
  <div class="container">
    <h1>SurveyList</h1>
    <template v-if="!isStudent">
      <button @click="this.$router.push('/ManagerSignup')">관리자 추가</button>
      <button @click="this.$router.push('/AddSurvey')">설문추가</button>
    </template>

    <div class="contents-container">
      <table>
        <thead>
          <tr>
            <th>생성</th>
            <th>제목</th>
            <th>시작</th>
            <th>종료</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="info in listOfPage">
            <tr :key="info.key">
              <td>{{info.createdAt}}</td>
              <td>{{info.title}}</td>
              <td>{{info.startDate}}</td>
              <td>{{info.finishDate}}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <button v-for="index in pageIndexs" :key="index">{{index}}</button>
      <div class="content" v-for="info in listOfPage" :key="info.key">{{info.title}}</div>
    </div>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import surveyService from "@/services/surveyApi.js";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "SurveyList",
  async mounted() {
    await this.runSpinner();

    if (!(await this.certifyUser())) {
      await this.hideSpinner();
      this.$router.push("/Signin");
      return;
    }
    await this.initSurveyInfos();

    await this.hideSpinner();
  },
  data() {
    return {
      userData: {
        role: "",
        id: "",
        name: "",
        departments: []
      },
      surveyInfos: {
        LIST_PER_PAGE: 10,
        PAGE_LIMIT: 5,
        currentIndex: 0,
        indexs: [],
        lists: [],
        maxPages: [],
        currentPages: []
      }
    };
  },
  computed: {
    isStudent() {
      return this.userData.role === "student";
    },
    listOfPage() {
      const index = this.surveyInfos.currentIndex;
      const allList = this.surveyInfos.lists[index];
      const currentPage = this.surveyInfos.currentPages[index];
      const startIndex = (currentPage - 1) * this.surveyInfos.LIST_PER_PAGE;
      const endIndex = startIndex + this.surveyInfos.LIST_PER_PAGE;
      const list = allList.slice(startIndex, endIndex);
      return list;
    },
    pageIndexs() {
      const index = this.surveyInfos.currentIndex;
      const currentPage = this.surveyInfos.currentPages[index];
      const maxPage = this.surveyInfos.maxPages[index];
      const startPage =
        currentPage - (currentPage % this.surveyInfos.PAGE_LIMIT);
      let endPage = startPage + this.surveyInfos.PAGE_LIMIT - 1;
      if (endPage > maxPage) {
        endPage = maxPage;
      }

      const pageIndexs = ["<<", "<", ">", ">>"];
      for (let i = endPage; i >= startPage; i--) {
        pageIndexs.splice(2, 0, i);
      }
    }
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async certifyUser() {
      this.userData.role = api.getCookie("role");
      api.setHeader("x-access-token", api.getCookie("accessToken"));
      api.setHeader("x-refresh-token", api.getCookie("refreshToken"));

      let apiRes;
      try {
        apiRes = await userService.certifyUser(this.userData.role);
      } catch (err) {
        if (await this.reissueToken(err)) {
          apiRes = await userService.certifyUser(this.userData.role);
        } else {
          console.log(api.getErrorMsg(err));
          alert("Authenticate fail");
          return false;
        }
      }

      const apiData = api.getResultData(apiRes);
      this.userData.id = apiData.id;
      this.userData.departments = apiData.departments;
      return true;
    },

    async reissueToken(err) {
      try {
        if (err.response && err.response.status === 401) {
          const tokenRes = await userService.reissueAccessToken(
            this.userData.role
          );
          const tokenData = api.getResultData(tokenRes);
          api.setCookie("accessToken", tokenData.accessToken);
          return true;
        }
      } catch (err) {
        console.log(api.getErrorMsg(err));
      }
      return false;
    },

    async initSurveyInfos() {
      try {
        for (const department of this.userData.departments) {
          const apiRes = await surveyService.queryList(department);
          const apiData = api.getResultData(apiRes);
          this.surveyInfos.indexs.push(department);
          this.surveyInfos.lists.push(apiData);

          const maxPage =
            parseInt(apiData.length / this.surveyInfos.LIST_PER_PAGE) + 1;
          this.surveyInfos.maxPages.push(maxPage);
          this.surveyInfos.currentPages.push(1);
        }
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert("Loading survey list fail");
      }
    },

    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    }
  }
};
</script>