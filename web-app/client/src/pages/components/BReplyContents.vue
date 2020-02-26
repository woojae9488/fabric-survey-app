<template>
  <div class="BReplyContents">
    <b-card
      v-for="(question,index) in questions"
      :key="index"
      border-variant="info"
      header-border-variant="info"
      align="center"
      class="my-2"
    >
      <b-container fluid>
        <b-row class="my-2">{{index + 1}}. {{question.title}}</b-row>

        <b-row v-if="isText(question)">
          <b-col sm="2">
            <label :for="`answer${index}`">Answer :</label>
          </b-col>
          <b-col sm="10">
            <b-form-input
              :id="`answer${index}`"
              v-model="results[index].answers[0]"
              placeholder="Input your answer"
            ></b-form-input>
          </b-col>
        </b-row>

        <b-row v-else-if="isTextArea(question)">
          <b-col sm="2">
            <label :for="`answer${index}`">Answer :</label>
          </b-col>
          <b-col sm="10">
            <b-form-textarea
              :id="`answer${index}`"
              v-model="results[index].answers[0]"
              rows="3"
              placeholder="Input your answer"
            ></b-form-textarea>
          </b-col>
        </b-row>

        <template v-else-if="isRadio(question)">
          <b-row>
            <b-col sm="2">
              <label :for="`answer${index}`">Answer :</label>
            </b-col>
          </b-row>
          <b-row>
            <b-form-radio-group
              :id="`answer${index}`"
              v-model="results[index].answers[0]"
              :options="question.contents"
            ></b-form-radio-group>
          </b-row>
        </template>

        <template v-else-if="isCheckBox(question)">
          <b-row>
            <b-col sm="2">
              <label :for="`answer${index}`">Answer :</label>
            </b-col>
          </b-row>
          <b-row>
            <b-form-checkbox-group
              :id="`answer${index}`"
              v-model="results[index].answers"
              :options="question.contents"
            ></b-form-checkbox-group>
          </b-row>
        </template>

        <template v-else-if="isSelect(question)">
          <b-row>
            <b-col sm="2">
              <label :for="`answer${index}`">Answer :</label>
            </b-col>
            <b-col sm="10">
              <b-form-select
                :id="`answer${index}`"
                v-model="results[index].answers"
                :options="question.contents"
              ></b-form-select>
            </b-col>
          </b-row>
        </template>
      </b-container>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "b-reply-contents",
  props: {
    questions: {
      type: Array,
      required: true
    },
    results: {
      type: Array,
      required: true
    }
  },
  created() {
    if (this.results.length === 0) {
      for (const index in this.questions) {
        this.results.push({
          number: index,
          answers: []
        });
      }
    }
  },
  methods: {
    isText(question) {
      return question.type === "text";
    },
    isTextArea(question) {
      return question.type === "textarea";
    },
    isRadio(question) {
      return question.type === "radio";
    },
    isCheckBox(question) {
      return question.type === "checkbox";
    },
    isSelect(question) {
      return question.type === "select";
    }
  }
};
</script>