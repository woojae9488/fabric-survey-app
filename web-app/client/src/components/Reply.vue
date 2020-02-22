<template>
  <div class="container">
    <h1>Reply</h1>
    {{department}}
    {{createdAt}}
    {{uid}}
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import eventBus from "@/utils/eventBus.js";

export default {
  name: "Reply",
  props: ["department", "createdAt", "uid"],
  created() {
    this.checkIdentity();
  },
  updated() {
    this.checkIdentity();
  },
  data() {
    return {};
  },
  computed: {},
  methods: {
    checkIdentity() {
      if (this.uid !== api.getData("user").id) {
        this.$router.push("/SurveyList");
      }
    },
    async func() {
      eventBus.$emit("runSpinner");

      eventBus.$emit("hideSpinner");
    }
  }
};
</script>