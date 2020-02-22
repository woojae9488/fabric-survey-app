<template>
  <div id="app">
    <img src="./assets/logo.png" alt="logo" width="50px" />
    <p>
      <router-link to="/Signin">Signin</router-link>&nbsp;
      <router-link to="/SurveyList">SurveyList</router-link>&nbsp;
    </p>

    <router-view></router-view>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import eventBus from "@/utils/eventBus.js";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "app",
  mounted() {
    eventBus.$on("runSpinner", this.runSpinner);
    eventBus.$on("hideSpinner", this.hideSpinner);
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async runSpinner() {
      await this.$refs.Spinner.show();
    },
    async hideSpinner() {
      await this.$refs.Spinner.hide();
    }
  }
};
</script>