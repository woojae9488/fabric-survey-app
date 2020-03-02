<template>
  <div class="BSurveyContent">
    <b-card :header="contentHeader" border-variant="info" header-border-variant="info" align="left">
      <b-row class="mb-1">
        <b-col sm="auto">Type :</b-col>
        <b-col sm="3">{{ question.type }}</b-col>
      </b-row>
      <b-row class="mb-1">
        <b-col sm="auto" v-if="isContentsExist">Contents :</b-col>
        <b-col sm="9">{{ contentsStr }}</b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
export default {
  name: 'b-survey-content',
  props: {
    number: {
      type: Number,
      required: true,
    },
    question: {
      type: Object,
      required: true,
    },
  },
  computed: {
    contentHeader() {
      return `Q${this.number}. ${this.question.title}`;
    },
    isContentsExist() {
      return this.question.contents.length > 0;
    },
    contentsStr() {
      return this.question.contents.join(', ');
    },
  },
};
</script>
