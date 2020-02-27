<template>
  <div class="Survey">
    <h2 class="pb-4">{{title}}</h2>

    <b-container fluid>
      <b-row v-if="isSurveyOwner" class="my-1" align-v="center">
        <b-col sm="3">
          <b-button
            :to="`/Replies/${this.department}/${this.createdAt}`"
            variant="outline-success"
            size="sm"
            pill
          >View Replies</b-button>
        </b-col>
        <b-col sm="1" offset-sm="6">
          <b-button
            :to="`/MakeSurvey/${this.department}/${this.createdAt}`"
            class="mx-1"
            variant="outline-primary"
            size="sm"
            pill
          >Update</b-button>
        </b-col>
        <b-col sm="1">
          <b-button
            @click="removeSurvey"
            class="mx-1"
            variant="outline-danger"
            size="sm"
            pill
          >Remove</b-button>
        </b-col>
      </b-row>

      <b-row class="my-3" align-v="center">
        <b-col sm="2" offset-sm="1">Survey Title :</b-col>
        <b-col sm="3">{{surveyInfo.title}}</b-col>
        <b-col sm="2">Department :</b-col>
        <b-col sm="3">{{surveyInfo.department}}</b-col>
      </b-row>

      <b-row class="my-3" align-v="center">
        <b-col sm="2" offset-sm="1">Start Date :</b-col>
        <b-col sm="3">{{getDateStr(surveyInfo.startDate)}}</b-col>
        <b-col sm="2">Finish Date :</b-col>
        <b-col sm="3">{{getDateStr(surveyInfo.finishDate)}}</b-col>
      </b-row>

      <b-row v-for="(question, index) in questions" class="my-4" align-h="center" :key="index">
        <b-col sm="8">
          <!-- <b-survey-content :number="index + 1" :question="question"></b-survey-content> -->
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import api from "@/services/api.js";
import surveyService from "@/services/surveyApi.js";
import eventBus from "@/utils/eventBus.js";
import BSurveyContent from "@/components/BSurveyContent.vue";

export default {
  name: "Survey",
  props: ["department", "createdAt"],
  components: { BSurveyContent },
  async created() {
    eventBus.$emit("runSpinner");

    this.userData = api.getDate("user");
    try {
      const apiRes = await surveyService.query(this.department, this.createdAt);
      const apiData = api.getResultData(apiRes);
      this.surveyInfo = apiData.surveyInfo;
      this.questions = apiData.questions;
    } catch (err) {
      console.log(api.getErrorMsg(err));
      alert("Loading survey data fail");
    } finally {
      eventBus.$emit("hideSpinner");
    }
  },
  data() {
    return {
      title: "Survey",
      userData: {},
      surveyInfo: {},
      questions: []
    };
  },
  computed: {
    isSurveyOwner() {
      return this.userData.id === this.surveyInfo.managerID;
    }
  },
  methods: {
    async removeSurvey() {
      const check = confirm("Are you sure you want to remove survey?");
      if (check) {
        try {
          await surveyService.remove(this.department, this.createdAt);
          this.$router.push("/SurveyList");
        } catch (err) {
          console.log(api.getErrorMsg(err));
          alert("Remove survey fail");
        }
      }
    },

    getDateStr(date) {
      return new Date(date).toLocaleString();
    }
  }
};
</script>