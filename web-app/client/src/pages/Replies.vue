<template>
  <div class="Replies">
    <h2 class="pb-4">{{ title }}</h2>

    <b-card
      v-if="isCreatedFinish"
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
          <b-button @click="exportToCSV" variant="info">Get CSV</b-button>
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
  components: { BQuestionResult },
  props: ['department', 'surveyCreatedAt'],
  data() {
    return {
      title: 'Replies',
      isCreatedFinish: false,
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
      return this.replyUsers.length > 0 ? this.replyUsers.join(', ') : 'No attendees';
    },
  },
  async created() {
    try {
      eventBus.$emit('runSpinner');
      await this.fillSurveyData();
      await this.fillRepliesData();
    } catch (err) {
      console.log(api.getErrorMsg(err));
      alert('Fail to lookup survey responses');
      this.$router.push('/SurveyList');
    } finally {
      eventBus.$emit('hideSpinner');
    }

    this.isCreatedFinish = true;
  },
  methods: {
    async fillSurveyData() {
      const surveyRes = await surveyService.query(this.department, this.surveyCreatedAt);
      const surveyData = api.getResultData(surveyRes);
      this.surveyInfo = surveyData.surveyInfo;
      this.questions = surveyData.questions;
    },

    async fillRepliesData() {
      const repliesRes = await replyService.queryAll(this.department, this.surveyCreatedAt);
      const repliesData = api.getResultData(repliesRes);
      repliesData.forEach(reply => {
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
    },

    transpose2DArray(array) {
      return array[0].map((col, i) => array.map(row => row[i]));
    },

    exportToCSV() {
      const csvMeta = 'data:text/csv;charset=utf-8,';
      const csvHeader = `id,${this.questions.map(question => question.title).join(',')}\r\n`;
      const csvBody = this.replyUsers
        .map(
          (user, index) =>
            `${user},${this.replyResults[index]
              .map(result => `"${result.answers.join(', ')}"`)
              .join(',')}`,
        )
        .join('\r\n');

      const csvContent = csvMeta + csvHeader + csvBody;
      const csvData = encodeURI(csvContent);
      const csvLink = document.createElement('a');
      csvLink.setAttribute('href', csvData);
      csvLink.setAttribute('download', `${this.surveyInfo.surveyKey}.csv`);
      csvLink.click();
    },
  },
};
</script>
