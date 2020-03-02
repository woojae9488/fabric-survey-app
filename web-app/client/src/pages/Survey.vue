<template>
  <div class="Survey">
    <h2 class="pb-4">{{ title }}</h2>

    <b-container v-if="isCreatedFinish" fluid>
      <b-row v-if="isSurveyOwner" class="my-1" align-v="center">
        <b-col sm="3">
          <b-button
            v-if="!isRegisteredState"
            :to="`/Replies/${this.department}/${this.createdAt}`"
            variant="outline-success"
            size="sm"
            pill
            >View Replies</b-button
          >
        </b-col>
        <b-col sm="1" offset-sm="6">
          <b-button
            v-if="isRegisteredState"
            :to="`/MakeSurvey/${this.department}/${this.createdAt}`"
            variant="outline-primary"
            size="sm"
            pill
            >Update</b-button
          >
        </b-col>
        <b-col sm="1">
          <b-button @click="removeSurvey" variant="outline-danger" size="sm" pill>Remove</b-button>
        </b-col>
      </b-row>

      <b-row class="my-3">
        <b-col sm="2" offset-sm="1">Survey Title :</b-col>
        <b-col sm="3">{{ surveyInfo.title }}</b-col>
        <b-col sm="2">Department :</b-col>
        <b-col sm="3">{{ surveyInfo.department }}</b-col>
      </b-row>

      <b-row class="my-3">
        <b-col sm="2" offset-sm="1">Start Date :</b-col>
        <b-col sm="3">{{ startDateStr }}</b-col>
        <b-col sm="2">Finish Date :</b-col>
        <b-col sm="3">{{ finishDateStr }}</b-col>
      </b-row>

      <b-row v-for="(question, index) in questions" class="my-4" align-h="center" :key="index">
        <b-col sm="8">
          <b-survey-content :number="index + 1" :question="question"></b-survey-content>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import api from '@/services/api';
import surveyService from '@/services/surveyApi';
import eventBus from '@/utils/eventBus';
import BSurveyContent from '@/components/BSurveyContent.vue';

export default {
  name: 'Survey',
  components: { BSurveyContent },
  props: ['department', 'createdAt'],
  data() {
    return {
      title: 'Survey',
      isCreatedFinish: false,
      surveyInfo: {},
      questions: [],
    };
  },
  computed: {
    isSurveyOwner() {
      return this.surveyInfo.managerID === api.getData('user').id;
    },
    isRegisteredState() {
      return this.surveyInfo.currentState === 1;
    },
    startDateStr() {
      return new Date(this.surveyInfo.startDate).toLocaleString();
    },
    finishDateStr() {
      return new Date(this.surveyInfo.finishDate).toLocaleString();
    },
  },
  async created() {
    try {
      eventBus.$emit('runSpinner');
      await this.fillSurveyData();
    } catch (err) {
      console.log(api.getErrorMsg(err));
      alert('Loading survey data fail');
    } finally {
      eventBus.$emit('hideSpinner');
    }

    this.isCreatedFinish = true;
  },
  methods: {
    async fillSurveyData() {
      const apiRes = await surveyService.query(this.department, this.createdAt);
      const apiData = api.getResultData(apiRes);
      this.surveyInfo = apiData.surveyInfo;
      this.questions = apiData.questions;
    },

    async removeSurvey() {
      const check = confirm('Are you sure you want to remove survey?');
      if (check) {
        try {
          await surveyService.remove(this.department, this.createdAt);
          this.$router.push('/SurveyList');
        } catch (err) {
          console.log(api.getErrorMsg(err));
          alert('Remove survey fail');
        }
      }
    },
  },
};
</script>
