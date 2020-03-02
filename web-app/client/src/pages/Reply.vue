<template>
  <div class="Reply">
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
        <b-form @submit.prevent="replySurvey">
          <b-row class="my-2" align-h="center" v-for="(question, index) in questions" :key="index">
            <b-col sm="11">
              <b-form-reply
                :number="index + 1"
                :question="question"
                :result="results[index]"
              ></b-form-reply>
            </b-col>
          </b-row>
          <b-row class="mt-4" align-h="center">
            <b-button type="submit" variant="info">{{ submitButtonStr }}</b-button>
          </b-row>
        </b-form>
      </b-container>
    </b-card>
  </div>
</template>

<script>
import api from '@/services/api';
import surveyService from '@/services/surveyApi';
import replyService from '@/services/replyApi';
import eventBus from '@/utils/eventBus';
import BFormReply from '@/components/BFormReply.vue';

export default {
  name: 'Reply',
  components: { BFormReply },
  props: ['department', 'surveyCreatedAt', 'uid'],
  data() {
    return {
      title: 'Respond to the survey',
      isCreatedFinish: false,
      surveyInfo: {},
      questions: [],
      existReplyInfo: null,
      results: [],
    };
  },
  computed: {
    isReplyExist() {
      return Boolean(this.existReplyInfo);
    },
    submitButtonStr() {
      return this.existReplyInfo ? 'Revise' : 'Respond';
    },
  },
  async created() {
    try {
      eventBus.$emit('runSpinner');
      if (this.checkIdentity()) {
        return;
      }

      await this.fillSurveyData();
      await this.fillExistReply();
    } catch (err) {
      console.log(api.getErrorMsg(err));
      alert('Fail to lookup survey data');
      this.$router.push('/SurveyList');
    } finally {
      eventBus.$emit('hideSpinner');
    }

    this.isCreatedFinish = true;
  },
  updated() {
    if (this.checkIdentity()) {
      this.$router.push('/SurveyList');
    }
  },
  methods: {
    checkIdentity() {
      return this.uid !== api.getData('user').id;
    },

    async fillSurveyData() {
      const surveyRes = await surveyService.query(this.department, this.surveyCreatedAt);
      const surveyData = api.getResultData(surveyRes);
      this.surveyInfo = surveyData.surveyInfo;
      this.questions = surveyData.questions;
      this.surveyInfo.surveyKey = surveyData.surveyKey;
    },

    async fillExistReply() {
      try {
        const replyRes = await replyService.query(this.department, this.surveyCreatedAt, this.uid);
        const replyData = api.getResultData(replyRes);
        this.existReplyInfo = replyData.replyInfo;
        this.results = replyData.results;
      } catch (err) {
        this.existReplyInfo = null;
        for (let i = 0; i < this.questions.length; i += 1) {
          this.results.push({ number: i, answers: [] });
        }
      }
    },

    async replySurvey() {
      const reply = replyService.makeReply(
        this.surveyInfo.surveyKey,
        this.uid,
        this.existReplyInfo,
        this.results,
      );

      try {
        eventBus.$emit('runSpinner');

        if (this.isReplyExist) {
          await replyService.revise(reply);
        } else {
          await replyService.respond(reply);
        }

        this.$router.push('/SurveyList');
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert('Fail to respond to the survey');
      } finally {
        eventBus.$emit('hideSpinner');
      }
    },
  },
};
</script>
