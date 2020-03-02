<template>
  <div class="SurveyList">
    <h2 class="pb-4">{{ title }}</h2>

    <template v-if="isManager">
      <b-container fluid>
        <b-row class="my-3">
          <b-col sm="4">
            <b-button to="/ManagerSignup" variant="outline-primary" size="sm">Add Manager</b-button>
          </b-col>
          <b-col sm="4" offset-sm="4">
            <b-button to="/MakeSurvey" variant="outline-primary" size="sm">Add Survey</b-button>
          </b-col>
        </b-row>
      </b-container>
    </template>

    <b-card no-body>
      <b-tabs card>
        <b-tab
          v-for="index in surveyInfos.indexs"
          :key="index"
          :title="index"
          @click="onClickSurveyIndex"
        >
          <b-table
            :items="surveyInfos.lists[surveyTable.index]"
            :fields="surveyTable.fields"
            :current-page="surveyTable.currentPage"
            :per-page="surveyTable.perPage"
            @row-clicked="onClickSurveyInfo"
            hover
            show-empty
          >
            <template v-slot:table-colgroup="scope">
              <col
                v-for="field in scope.fields"
                :key="field.key"
                :style="{ width: field.key === 'title' ? '140px' : '50px' }"
              />
            </template>
          </b-table>

          <b-row class="my-1" align-h="center">
            <b-col sm="7">
              <b-pagination
                v-model="surveyTable.currentPage"
                :total-rows="surveyTable.totalRows"
                :per-page="surveyTable.perPage"
                align="fill"
                size="sm"
              ></b-pagination>
            </b-col>
          </b-row>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
import api from '@/services/api';
import surveyService from '@/services/surveyApi';
import eventBus from '@/utils/eventBus';

export default {
  name: 'SurveyList',
  data() {
    return {
      title: 'Survey List',
      userData: {},
      surveyInfos: {
        indexs: [],
        lists: [],
      },
      surveyState: ['registered', 'surveying', 'finished'],
      surveyTable: {
        index: 0,
        totalRows: 1,
        perPage: 7,
        currentPage: 1,
        fields: [
          { key: 'currentState', sortable: true },
          { key: 'title', sortable: false },
          { key: 'startDate', sortable: true },
          { key: 'finishDate', sortable: true },
        ],
      },
    };
  },
  computed: {
    isStudent() {
      return this.userData.role === 'student';
    },
    isManager() {
      return this.userData.role === 'manager';
    },
  },
  async created() {
    try {
      eventBus.$emit('runSpinner');
      this.fillUserData();
      await this.fillSurveyLists();
    } catch (err) {
      console.log(api.getErrorMsg(err));
      alert('Fail to lookup survey list');
    } finally {
      eventBus.$emit('hideSpinner');
    }
  },
  methods: {
    fillUserData() {
      this.userData = api.getData('user');
      this.userData.role = api.getData('role');
    },

    getFormatedDate(time) {
      // yy.MM.dd HH:mm
      const d = new Date(time);
      const minute = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();

      return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${d.getHours()}:${minute}`;
    },

    changeInfosToRows(infos) {
      const rowData = [];

      infos.forEach(info => {
        const keys = Object.keys(info);
        const row = {};
        row.path = `/${info.department}/${info.createdAt}`;

        keys.forEach(key => {
          if (key === 'currentState') {
            row[key] = this.surveyState[info[key] - 1];
          } else if (key === 'startDate' || key === 'finishDate') {
            row[key] = this.getFormatedDate(info[key]);
          } else {
            row[key] = info[key];
          }
        });
        rowData.push(row);
      });

      return rowData;
    },

    async fillSurveyLists() {
      await this.userData.departments.reduce(async (prevPromise, department) => {
        await prevPromise;

        const apiRes = await surveyService.queryList(department);
        const apiData = api.getResultData(apiRes);
        const rowData = this.changeInfosToRows(apiData);
        this.surveyInfos.indexs.push(department);
        this.surveyInfos.lists.push(rowData);
      }, Promise.resolve());

      this.surveyTable.totalRows = this.surveyInfos.lists[0].length;
    },

    onClickSurveyInfo(item) {
      if (this.isStudent && item.currentState === this.surveyState[1]) {
        this.$router.push(`/Reply${item.path}/${this.userData.id}`);
      } else if (this.isManager) {
        this.$router.push(`/Survey${item.path}`);
      }
    },

    onClickSurveyIndex(event) {
      const indexName = event.target.innerHTML;
      const index = this.surveyInfos.indexs.indexOf(indexName);
      const totalRows = this.surveyInfos.lists[index].length;
      this.surveyTable.index = index;
      this.surveyTable.totalRows = totalRows;
      this.surveyTable.currentPage = 1;
    },
  },
};
</script>
