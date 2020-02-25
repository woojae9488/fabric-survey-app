<template>
  <div class="BSurveyContent">
    <b-card
      :header="'Q' + number + '. ' + question.title"
      border-variant="info"
      header-border-variant="info"
      align="left"
    >
      <b-row class="mb-1" align-v="center">
        <b-col sm="auto">Type :</b-col>
        <b-col sm="3">{{question.type}}</b-col>
      </b-row>
      <b-row class="mb-1" align-v="center">
        <b-col sm="auto" v-if="question.contents.length">Contents :</b-col>
        <b-col sm="9">{{question.contents.join(", ")}}</b-col>
      </b-row>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "b-survey-content",
  props: {
    number: {
      type: Number,
      required: true
    },
    question: {
      type: Object,
      required: true
    }
  }
};
</script>