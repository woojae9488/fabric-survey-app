<template>
  <div class="Replies">
    <h2 class="pb-4">{{ title }}</h2>

    <b-card
      v-if="createdFinish"
      :header="surveyInfo.title"
      header-tag="h4"
      border-variant="info"
      header-border-variant="info"
      align="center"
    >
      <b-container fluid>
        <b-row class="my-2" align-h="center">
          <b-col sm="11">
            <b-card border-variant="info" header-border-variant="info" align="left"
              >Survey Attendees ({{ replyUsersCnt }}) : {{ replyUsersStr }}</b-card
            >
          </b-col>
        </b-row>
        <b-row class="my-2" align-h="center" v-for="(question, index) in questions" :key="index">
          <b-col sm="11">
            <b-question-result
              :number="index + 1"
              :question="question"
              :results="questionResults[index]"
            ></b-question-result>
          </b-col>
        </b-row>
        <b-row class="mt-4" align-h="center">
          <b-button to="/SurveyList" variant="info">Survey List</b-button>
        </b-row>
      </b-container>
    </b-card>
  </div>
</template>

<script>
import api from '@/services/api';
import surveyService from '@/services/surveyApi';
import replyService from '@/services/replyApi';
import eventBus from '@/utils/eventBus';
import BQuestionResult from '@/components/BQuestionResult.vue';

export default {
  name: 'Replies',
  props: ['department', 'surveyCreatedAt'],
  components: { BQuestionResult },
  async created() {
    eventBus.$emit('runSpinner');

    try {
      const surveyRes = await surveyService.query(this.department, this.surveyCreatedAt);
      const surveyData = api.getResultData(surveyRes);
      this.surveyInfo = surveyData.surveyInfo;
      this.questions = surveyData.questions;

      const replyRes = await replyService.queryAll(this.department, this.surveyCreatedAt);
      const replyData = api.getResultData(replyRes);
      replyData.forEach(reply => {
        this.replyUsers.push(reply.replyInfo.studentID);
        this.replyResults.push(reply.results);
      });

      if (this.replyUsersCnt > 0) {
        this.questionResults = this.transpose2DArray(this.replyResults);
      } else {
        for (let i = 0; i < this.questions.length; i += 1) {
          this.questionResults.push([]);
        }
      }

      this.createdFinish = true;
    } catch (err) {
      console.log(api.getErrorMsg(err));
      alert('Survey response lookup fail');
      this.$router.push('/SurveyList');
    } finally {
      eventBus.$emit('hideSpinner');
    }
  },
  data() {
    return {
      title: 'Replies',
      createdFinish: false,
      surveyInfo: {},
      questions: [],
      replyUsers: [],
      replyResults: [],
      questionResults: [],
    };
  },
  computed: {
    replyUsersCnt() {
      return this.replyUsers.length;
    },
    replyUsersStr() {
      return this.replyUsers.length === 0 ? 'No attendees' : this.replyUsers.join(', ');
    },
  },
  methods: {
    transpose2DArray(array) {
      return array[0].map((col, i) => array.map(row => row[i]));
    },
  },
};
</script>
