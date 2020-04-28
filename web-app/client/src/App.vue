<template>
  <div
    id="app"
    class="mt-1 mx-auto pb-5 text-center"
    style="width: 750px; font-family: 'Avenir', Arial, sans-serif;"
  >
    <b-container fluid>
      <b-row align-v="center">
        <b-col sm="1">
          <img src="./assets/logo.png" @click="clickLogoImg" width="40px" class="mb-4" />
        </b-col>
        <b-col v-if="isLogined" sm="2" offset-sm="7">
          <b-button to="/ChangeInfo" variant="outline-primary" size="sm" pill>ChangeInfo</b-button>
        </b-col>
        <b-col v-if="isLogined" sm="1">
          <b-button @click="logout" variant="outline-danger" size="sm" pill>Logout</b-button>
        </b-col>
      </b-row>
    </b-container>

    <router-view></router-view>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import api from '@/services/api';
import eventBus from '@/utils/eventBus';
import VueInstantLoadingSpinner from 'vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue';

export default {
  name: 'app',
  components: { VueInstantLoadingSpinner },
  data() {
    return { isLogined: false };
  },
  created() {
    if (this.checkValidity()) {
      this.isLogined = true;
    }
  },
  updated() {
    if (this.checkValidity()) {
      this.isLogined = true;
    }
  },
  mounted() {
    eventBus.$on('runSpinner', this.runSpinner);
    eventBus.$on('hideSpinner', this.hideSpinner);
  },
  methods: {
    async runSpinner() {
      await this.$refs.Spinner.show();
    },
    async hideSpinner() {
      await this.$refs.Spinner.hide();
    },
    checkValidity() {
      return Boolean(api.getData('accessToken') && api.getData('refreshToken'));
    },
    clickLogoImg() {
      if (this.isLogined) {
        this.$router.push('/SurveyList');
      } else {
        this.$router.push('/Signin');
      }
    },
    logout() {
      api.clearData();
      this.isLogined = false;
      this.$router.push('/');
    },
  },
};
</script>
