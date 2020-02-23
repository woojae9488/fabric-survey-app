<template>
  <div
    id="app"
    class="mt-5 mx-auto pb-5 text-center"
    style="width: 750px; font-family: 'Avenir', Arial, sans-serif;"
  >
    <img src="./assets/logo.png" width="70px" class="mb-4" />

    <p>
      <router-link to="/Signin">Signin</router-link>
    </p>

    <div id="contents">
      <router-view></router-view>
    </div>

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
