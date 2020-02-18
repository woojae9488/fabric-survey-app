<template>
  <div class="container">
    <h1>SurveyList</h1>

    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import api from "@/services/api.js";
import surveyService from "@/services/surveyApi.js";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "SurveyList",
  created() {
    api.setHeader("x-access-token", api.getCookie("accessToken"));
    api.setHeader("x-refresh-token", api.getCookie("refreshToken"));
  },
  data() {
    return {
      id: "",
      name: "",
      departments: [],
      surveyInfos: {
        indexs: [],
        lists: []
      }
    };
  },
  computed: {},
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async getSurveyInfos() {
      await this.runSpinner();

      try {
        this.departments.forEach(async department => {
          const apiRes = await surveyService.queryList(department);
          const apiData = api.getResultData(apiRes);
          this.surveyInfos.indexs.push(department);
          this.surveyInfos.lists.push(apiData);
        });
        // need more process
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert("Loading list fail");
      } finally {
        await this.hideSpinner();
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