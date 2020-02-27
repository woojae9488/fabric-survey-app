<template>
  <div class="BFormReply">
    <b-card border-variant="info" header-border-variant="info">
      <b-container fluid>
        <b-row class="my-2">{{number}}. {{question.title}}</b-row>

        <b-row v-if="isText">
          <b-col sm="2">
            <label :for="`answer${number}`">Answer :</label>
          </b-col>
          <b-col sm="10">
            <b-form-input
              :id="`answer${number}`"
              v-model="result.answers[0]"
              placeholder="Input your answer"
              required
            ></b-form-input>
          </b-col>
        </b-row>

        <b-row v-else-if="isTextArea">
          <b-col sm="2">
            <label :for="`answer${number}`">Answer :</label>
          </b-col>
          <b-col sm="10">
            <b-form-textarea
              :id="`answer${number}`"
              v-model="result.answers[0]"
              rows="3"
              placeholder="Input your answer"
              required
            ></b-form-textarea>
          </b-col>
        </b-row>

        <template v-else-if="isRadio">
          <b-row>
            <b-col sm="2">
              <label :for="`answer${number}`">Answer :</label>
            </b-col>
          </b-row>
          <b-row>
            <b-form-radio-group
              :id="`answer${number}`"
              v-model="result.answers[0]"
              :options="question.contents"
              required
            ></b-form-radio-group>
          </b-row>
        </template>

        <template v-else-if="isCheckBox">
          <b-row>
            <b-col sm="2">
              <label :for="`answer${number}`">Answer :</label>
            </b-col>
          </b-row>
          <b-row>
            <b-form-checkbox-group
              :id="`answer${number}`"
              v-model="result.answers"
              :options="question.contents"
              required
            ></b-form-checkbox-group>
          </b-row>
        </template>

        <template v-else-if="isSelect">
          <b-row>
            <b-col sm="2">
              <label :for="`answer${number}`">Answer :</label>
            </b-col>
            <b-col sm="10">
              <b-form-select
                :id="`answer${number}`"
                v-model="result.answers[0]"
                :options="question.contents"
                required
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
  name: "b-form-reply",
  props: {
    number: {
      type: Number,
      required: true
    },
    question: {
      type: Object,
      required: true
    },
    result: {
      type: Object,
      required: true
    }
  },
  computed: {
    isText() {
      return this.question.type === "text";
    },
    isTextArea() {
      return this.question.type === "textarea";
    },
    isRadio() {
      return this.question.type === "radio";
    },
    isCheckBox() {
      return this.question.type === "checkbox";
    },
    isSelect() {
      return this.question.type === "select";
    }
  }
};
</script>