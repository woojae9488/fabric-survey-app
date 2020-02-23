<template>
  <div class="MakeSurvey">
    <h2 class="pb-4">{{title}}</h2>

    <!-- <template v-for="(question,index) in questions">
      <div class="question-content" :key="question.number">
        <h3>{{question.title}} ({{question.type}})</h3>
        <p v-for="content in question.contents" :key="content">{{content}}</p>
        <button :name="index" @click.prevent="removeQuestion">X</button>
      </div>
    </template>-->
    <b-card
      v-if="isMakerLive"
      header="Question Maker"
      header-tag="h5"
      border-variant="success"
      header-border-variant="success"
      align="left"
    >
      <b-container fluid>
        <b-form @submit.prevent="makeQuestion">
          <b-row class="mb-4" align-v="center">
            <b-col sm="auto">
              <label for="question-title">Title :</label>
            </b-col>
            <b-col sm="6">
              <b-form-input
                id="question-title"
                v-model="maker.title"
                placeholder="Enter survey question title"
                trim
                required
              ></b-form-input>
            </b-col>
            <b-col sm="auto">
              <label for="question-type">Type :</label>
            </b-col>
            <b-col sm="3">
              <b-form-select
                id="question-type"
                v-model="maker.type"
                :options="maker.typeOptions"
                required
              ></b-form-select>
            </b-col>
          </b-row>

          <b-container v-if="isOptionalType" fluid>
            <template v-for="(content, index) in maker.contents">
              <b-row :key="content" class="my-1">
                <b-col sm="4">Content {{index + 1}}</b-col>
                <b-col sm="5">{{content}}</b-col>
                <b-col sm="3">
                  <b-button
                    :name="index"
                    @click="deleteContent"
                    variant="outline-danger"
                    size="sm"
                    pill
                  >Delete</b-button>
                </b-col>
              </b-row>
            </template>

            <b-row class="my-4" align-v="center">
              <b-col sm="3">
                <label for="new-content">New Content :</label>
              </b-col>
              <b-col sm="6">
                <b-form-input
                  id="new-content"
                  v-model="maker.newContent"
                  placeholder="Enter question content"
                  trim
                ></b-form-input>
              </b-col>
              <b-col sm="3">
                <b-button @click="addContent" variant="outline-info" size="sm" pill>Push</b-button>
              </b-col>
            </b-row>
          </b-container>

          <b-row class="my-1 p-2" align-h="center">
            <b-col sm="13">
              <b-button type="submit" variant="info">Add</b-button>
            </b-col>
          </b-row>
        </b-form>
      </b-container>
    </b-card>

    <b-button v-else @click="toggleMaker" variant="info">Add Question</b-button>
    <!--  -->
    <!--  -->
  </div>
</template>

<script>
import api from "@/services/api.js";
import surveyService from "@/services/surveyApi.js";
import eventBus from "@/utils/eventBus.js";

import Survey from "@/chaincode/lib/Survey.js";

export default {
  name: "MakeSurvey",
  data() {
    return {
      title: "Make your Survey",
      isMakerLive: false,
      questions: [],
      maker: {
        title: "",
        type: "",
        typeOptions: ["text", "textarea", "radio", "checkbox", "select"],
        newContent: "",
        contents: []
      }
    };
  },
  computed: {
    isOptionalType() {
      return this.maker.typeOptions.indexOf(this.maker.type) >= 2;
    }
  },
  methods: {
    async func() {
      eventBus.$emit("runSpinner");

      eventBus.$emit("hideSpinner");
    },

    toggleMaker() {
      this.isMakerLive = !this.isMakerLive;
    },

    makeQuestion() {
      const question = {
        title: this.maker.title,
        type: this.maker.type,
        contents: this.maker.contents
      };
      this.questions.push(question);

      this.maker.title = "";
      this.maker.type = "";
      this.maker.contents = [];
      this.toggleMaker();
    },

    removeQuestion(event) {
      const index = event.target.name;
      this.questions.splice(index, 1);
    },

    addContent() {
      this.maker.contents.push(this.maker.newContent);
      this.maker.newContent = "";
    },

    deleteContent(event) {
      const index = event.target.name;
      this.maker.contents.splice(index, 1);
    }
  }
};
</script>