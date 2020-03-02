<template>
  <div class="MakeSurvey">
    <h2 class="pb-4">{{ title }}</h2>

    <b-form @submit.prevent="registerSurvey">
      <b-container v-if="isCreatedFinish" fluid>
        <b-row class="my-2" align-v="center">
          <b-col sm="auto">
            <label for="survey-title">Survey Title :</label>
          </b-col>
          <b-col sm="6">
            <b-form-input
              id="survey-title"
              v-model="surveyInfo.title"
              placeholder="Enter survey title"
              trim
              required
            ></b-form-input>
          </b-col>
          <b-col sm="auto">
            <label for="survey-department">Department :</label>
          </b-col>
          <b-col sm="2">
            <b-form-select
              id="survey-department"
              v-model="surveyInfo.department"
              :disabled="isSurveyExist"
              :options="userData.departments"
              required
            ></b-form-select>
          </b-col>
        </b-row>

        <b-row class="my-2" align-v="center">
          <b-col sm="2">
            <label for="survey-start-date">Start Date :</label>
          </b-col>
          <b-col sm="4">
            <b-form-input
              id="survey-start-date"
              type="date"
              v-model="surveyInfo.startDate"
              required
            ></b-form-input>
          </b-col>
          <b-col sm="2">
            <label for="survey-start-time">Start Time :</label>
          </b-col>
          <b-col sm="4">
            <b-form-input
              id="survey-start-time"
              type="time"
              v-model="surveyInfo.startTime"
              required
            ></b-form-input>
          </b-col>
        </b-row>

        <b-row class="mt-2 mb-5" align-v="center">
          <b-col sm="2">
            <label for="survey-finish-date">Finish Date :</label>
          </b-col>
          <b-col sm="4">
            <b-form-input
              id="survey-finish-date"
              type="date"
              v-model="surveyInfo.finishDate"
              required
            ></b-form-input>
          </b-col>
          <b-col sm="2">
            <label for="survey-finish-time">Finish Time :</label>
          </b-col>
          <b-col sm="4">
            <b-form-input
              id="survey-finish-time"
              type="time"
              v-model="surveyInfo.finishTime"
              required
            ></b-form-input>
          </b-col>
        </b-row>

        <b-row class="my-2" v-for="(question, index) in questions" :key="index" align-v="center">
          <b-col sm="2">
            <b-container fluid>
              <b-row class="mb-1" align-h="center">
                <b-button
                  :name="index"
                  @click="moveUpQuestion"
                  variant="outline-info"
                  size="sm"
                  pill
                  >Up</b-button
                >
              </b-row>
              <b-row class="mt-1" align-h="center">
                <b-button
                  :name="index"
                  @click="moveDownQuestion"
                  variant="outline-info"
                  size="sm"
                  pill
                  >Down</b-button
                >
              </b-row>
            </b-container>
          </b-col>

          <b-col sm="8">
            <b-survey-content :number="index + 1" :question="question"></b-survey-content>
          </b-col>

          <b-col sm="2">
            <b-button :name="index" @click="removeQuestion" variant="outline-danger" pill
              >Delete</b-button
            >
          </b-col>
        </b-row>
      </b-container>

      <b-container v-if="isMakerHide" class="my-4">
        <b-row class="my-2" align-h="center">
          <b-button @click="toggleMaker" variant="info">Add Question</b-button>
        </b-row>
        <b-row v-if="isQuestionExist" class="my-3" align-h="center">
          <b-button type="submit" variant="success">{{ submitButtonStr }}</b-button>
        </b-row>
      </b-container>

      <b-card
        v-else
        class="my-4"
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
                  <b-col sm="4">Content {{ index + 1 }}</b-col>
                  <b-col sm="5">{{ content }}</b-col>
                  <b-col sm="3">
                    <b-button
                      :name="index"
                      @click="deleteContent"
                      variant="outline-danger"
                      size="sm"
                      pill
                      >Delete</b-button
                    >
                  </b-col>
                </b-row>
              </template>

              <b-form @submit.prevent="addContent">
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
                    <b-button type="submit" variant="outline-info" size="sm" pill>Push</b-button>
                  </b-col>
                </b-row>
              </b-form>
            </b-container>

            <b-row class="my-1 p-2" align-h="center">
              <b-col sm="13">
                <b-button type="submit" variant="info">Add</b-button>
              </b-col>
            </b-row>
          </b-form>
        </b-container>
      </b-card>
    </b-form>
  </div>
</template>

<script>
import api from '@/services/api';
import surveyService from '@/services/surveyApi';
import eventBus from '@/utils/eventBus';
import BSurveyContent from '@/components/BSurveyContent.vue';

export default {
  name: 'MakeSurvey',
  components: { BSurveyContent },
  props: ['department', 'createdAt'],
  data() {
    return {
      title: 'Make your Survey',
      isCreatedFinish: false,
      isMakerHide: true,
      userData: {},
      surveyInfo: {},
      questions: [],
      maker: {
        title: '',
        type: '',
        typeOptions: ['text', 'textarea', 'radio', 'checkbox', 'select'],
        newContent: '',
        contents: [],
      },
    };
  },
  computed: {
    isOptionalType() {
      return this.maker.typeOptions.indexOf(this.maker.type) >= 2;
    },
    isQuestionExist() {
      return this.questions.length;
    },
    isSurveyExist() {
      return Boolean(this.department && this.createdAt);
    },
    submitButtonStr() {
      return this.department && this.createdAt ? 'Update' : 'Register';
    },
  },
  async created() {
    if (this.isSurveyExist) {
      try {
        eventBus.$emit('runSpinner');
        await this.fillSurveyData();
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert('Query exist survey fail');
      } finally {
        eventBus.$emit('hideSpinner');
      }
    }

    this.userData = api.getData('user');
    this.isCreatedFinish = true;
  },
  methods: {
    splitDateJSON(dateBase) {
      const timeMS = parseInt(dateBase, 10) + 540 * 60 * 1000;
      const dateObj = new Date(timeMS);
      const splits = dateObj.toJSON().split('T');
      const date = splits[0];
      const time = splits[1].slice(0, 5);
      return { date, time };
    },

    overwriteExistData(data) {
      this.surveyInfo = data.surveyInfo;
      this.questions = data.questions;

      const start = this.splitDateJSON(this.surveyInfo.startDate);
      this.surveyInfo.startDate = start.date;
      this.surveyInfo.startTime = start.time;
      const finish = this.splitDateJSON(this.surveyInfo.finishDate);
      this.surveyInfo.finishDate = finish.date;
      this.surveyInfo.finishTime = finish.time;
    },

    async fillSurveyData() {
      const apiRes = await surveyService.query(this.department, this.createdAt);
      const apiData = api.getResultData(apiRes);
      this.overwriteExistData(apiData);
    },

    toggleMaker() {
      this.isMakerHide = !this.isMakerHide;
    },

    addContent() {
      this.maker.contents.push(this.maker.newContent);
      this.maker.newContent = '';
    },

    deleteContent(event) {
      const index = event.target.name;
      this.maker.contents.splice(index, 1);
    },

    makeQuestion() {
      const question = {
        title: this.maker.title,
        type: this.maker.type,
        contents: this.maker.contents,
      };
      this.questions.push(question);

      this.maker.title = '';
      this.maker.type = '';
      this.maker.newContent = '';
      this.maker.contents = [];
      this.toggleMaker();
    },

    removeQuestion(event) {
      const index = event.target.name;
      this.questions.splice(index, 1);
    },

    moveUpQuestion(event) {
      const index = parseInt(event.target.name, 10);
      if (index === 0) {
        return;
      }
      const question = this.questions.splice(index, 1);
      this.questions.splice(index - 1, 0, ...question);
    },

    moveDownQuestion(event) {
      const index = parseInt(event.target.name, 10);
      if (index === this.questions.length - 1) {
        return;
      }
      const question = this.questions.splice(index, 1);
      this.questions.splice(index + 1, 0, ...question);
    },

    async registerSurvey() {
      const start = `${this.surveyInfo.startDate} ${this.surveyInfo.startTime}`;
      const finish = `${this.surveyInfo.finishDate} ${this.surveyInfo.finishTime}`;
      this.surveyInfo.start = new Date(start).getTime();
      this.surveyInfo.finish = new Date(finish).getTime();

      const survey = surveyService.makeSurvey(this.userData.id, this.surveyInfo, this.questions);

      try {
        eventBus.$emit('runSpinner');

        if (this.isSurveyExist) {
          await surveyService.update(survey);
        } else {
          await surveyService.register(survey);
        }

        this.$router.push('/SurveyList');
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert('Fail to make survey');
      } finally {
        eventBus.$emit('hideSpinner');
      }
    },
  },
};
</script>
