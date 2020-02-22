<template>
  <div class="container">
    <h1>SurveyList</h1>
    <template v-if="isManager">
      <router-link to="/ManagerSignup">관리자 추가</router-link>
      <router-link to="/MakeSurvey">설문 추가</router-link>
    </template>

    <button v-for="index in surveyInfos.indexs" :key="index" @click="changeSurveyIndex">{{index}}</button>

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
          <template v-for="info in currentInfo.listOfPage">
            <tr :key="info.key">
              <td>{{toDateStr(info.createdAt)}}</td>
              <td>
                <router-link
                  v-if="isStudent"
                  :to="{name:'Reply', params:{department:info.department, createdAt:info.createdAt, uid:userData.id}}"
                >{{info.title}}</router-link>
                <router-link
                  v-else-if="isManager"
                  :to="{name:'Survey', params:{department:info.department, createdAt:info.createdAt}}"
                >{{info.title}}</router-link>
              </td>
              <td>{{toDateStr(info.startDate)}}</td>
              <td>{{toDateStr(info.finishDate)}}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <button v-for="index in currentInfo.pageIndexs" :key="index" @click="changeListPage">{{index}}</button>
    </div>
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import surveyService from "@/services/surveyApi.js";
import eventBus from "@/utils/eventBus.js";

export default {
  name: "SurveyList",
  async created() {
    eventBus.$emit("runSpinner");

    this.userData = api.getData("user");
    this.userData.role = api.getData("role");

    await this.initSurveyInfos();
    this.refreshList();

    eventBus.$emit("hideSpinner");
  },
  data() {
    return {
      LIST_PER_PAGE: 10,
      PAGE_LIMIT: 5,
      userData: {},
      surveyInfos: {
        indexs: [],
        lists: [],
        maxPages: []
      },
      currentInfo: {
        index: 0,
        page: 1,
        listOfPage: [],
        pageIndexs: []
      }
    };
  },
  computed: {
    isStudent() {
      return this.userData.role === "student";
    },
    isManager() {
      return this.userData.role === "manager";
    }
  },
  methods: {
    async initSurveyInfos() {
      try {
        for (const department of this.userData.departments) {
          const apiRes = await surveyService.queryList(department);
          const apiData = api.getResultData(apiRes);
          this.surveyInfos.indexs.push(department);
          this.surveyInfos.lists.push(apiData);

          const maxPage = parseInt(apiData.length / this.LIST_PER_PAGE) + 1;
          this.surveyInfos.maxPages.push(maxPage);
        }
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert("Loading survey list fail");
      }
    },

    refreshList() {
      this.setListOfPage();
      this.setPageIndexs();
    },

    setListOfPage() {
      const list = this.surveyInfos.lists[this.currentInfo.index];
      const startIndex = (this.currentInfo.page - 1) * this.LIST_PER_PAGE;
      const endIndex = startIndex + this.LIST_PER_PAGE;
      this.currentInfo.listOfPage = list.slice(startIndex, endIndex);
    },

    setPageIndexs() {
      const index = this.currentInfo.index;
      const page = this.currentInfo.page;

      const maxPage = this.surveyInfos.maxPages[index];
      const start =
        parseInt((page - 1) / this.PAGE_LIMIT) * this.PAGE_LIMIT + 1;
      let end = start + this.PAGE_LIMIT - 1;
      if (end > maxPage) {
        end = maxPage;
      }

      this.currentInfo.pageIndexs = ["<<", "<"];
      for (let i = start; i <= end; i++) {
        this.currentInfo.pageIndexs.push(i);
      }
      this.currentInfo.pageIndexs.push(">", ">>");
    },

    changeSurveyIndex(event) {
      const indexName = event.target.innerHTML;
      const index = this.surveyInfos.indexs.indexOf(indexName);
      this.currentInfo.index = index;
      this.currentInfo.page = 1;

      this.refreshList();
    },

    changeListPage(event) {
      const page = event.target.innerHTML;
      const maxPage = this.surveyInfos.maxPages[this.currentInfo.index];
      const lastPageIndexsStart =
        parseInt((maxPage - 1) / this.PAGE_LIMIT) * this.PAGE_LIMIT + 1;
      switch (page) {
        case "&lt;&lt;":
          if (this.currentInfo.page > this.PAGE_LIMIT) {
            this.currentInfo.page -= this.PAGE_LIMIT;
          }
          break;
        case "&lt;":
          if (this.currentInfo.page > 1) {
            this.currentInfo.page--;
          }
          break;
        case "&gt;":
          if (this.currentInfo.page < maxPage) {
            this.currentInfo.page++;
          }
          break;
        case "&gt;&gt;":
          if (this.currentInfo.page < lastPageIndexsStart) {
            this.currentInfo.page += this.PAGE_LIMIT;
          }
          break;
        default:
          this.currentInfo.page = page;
          break;
      }

      this.refreshList();
    },

    toDateStr(msec) {
      return new Date(msec).toLocaleString();
    }
  }
};
</script>