<template>
  <div class="BQuestionResult">
    <b-card border-variant="info" header-border-variant="info">
      <b-container fluid>
        <b-row class="my-2">{{ number }}. {{ question.title }}</b-row>

        <template v-if="isSubjective">
          <b-row class="my-1">Answers :</b-row>
          <b-row v-for="result in results" :key="result.resultNum">{{ result.answers[0] }}</b-row>
        </template>

        <template v-else>
          <b-row class="my-1">Answers Count :</b-row>
          <b-row v-for="content in question.contents" :key="content"
            >{{ content }} : {{ getAnswerCount(content) }}</b-row
          >
        </template>
      </b-container>
    </b-card>
  </div>
</template>

<script>
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
  },
  methods: {
    getAnswerCount(content) {
      return this.results.filter(r => r.answers.indexOf(content) + 1).length;
    },
  },
};
</script>
