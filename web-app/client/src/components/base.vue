<template>
  <div class="container">
    <h1>Signup</h1>

    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "",
  data() {
    return {};
  },
  computed: {},
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async func() {
      await this.runSpinner();

      await this.hideSpinner();
    },
    async runSpinner() {
      this.$refs.Spinner.show();
    },
    async hideSpinner() {
      this.$refs.Spinner.hide();
    }
  }
};
</script>