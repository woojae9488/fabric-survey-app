<template>
  <div class="BQuestionResult">
    <b-card border-variant="info" header-border-variant="info">
      <b-container fluid>
        <b-row class="my-2">{{ number }}. {{ question.title }}</b-row>

        <template v-if="resultsState">
          <template v-if="isSubjective">
            <b-row class="my-1">Answers :</b-row>
            <b-row v-for="result in results" :key="result.resultNum">{{ result.answers[0] }}</b-row>
          </template>

          <b-row v-else>
            <result-bar-chart
              :labels="question.contents"
              :datas="answerCnts"
              :height="80"
              :width="550"
            ></result-bar-chart>
          </b-row>
        </template>

        <b-row v-else class="my-1">No Answers</b-row>
      </b-container>
    </b-card>
  </div>
</template>

<script>
import ResultBarChart from '@/components/ResultBarChart';

export default {
  name: 'b-question-result',
  props: {
    number: {
      type: Number,
      required: true,
    },
    question: {
      type: Object,
      required: true,
    },
    results: {
      type: Array,
      required: true,
    },
  },
  components: { ResultBarChart },
  created() {
    if (!this.isSubjective) {
      for (let i = 0; i < this.question.contents.length; i += 1) {
        this.answerCnts.push(0);
      }

      this.results.forEach(result => {
        result.answers.forEach(answer => {
          const index = this.question.contents.indexOf(answer);
          this.answerCnts[index] += 1;
        });
      });
    }
  },
  data() {
    return {
      answerCnts: [],
    };
  },
  computed: {
    isSubjective() {
      switch (this.question.type) {
        case 'text':
        case 'textarea':
          return true;
        case 'radio':
        case 'checkbox':
        case 'select':
          return false;
        default:
          return null;
      }
    },
    resultsState() {
      return this.results.length > 0;
    },
  },
};
</script>
