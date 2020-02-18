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
  name: "SurveyList",
  data() {
    return {};
  },
  computed: {},
  components: {
    VueInstantLoadingSpinner
  },
  methods: {}
};
</script>