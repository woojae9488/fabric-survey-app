<template>
  <div class="container">
    <h1>Title</h1>
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import eventBus from "@/utils/eventBus.js";

export default {
  name: "",
  data() {
    return {};
  },
  computed: {},
  methods: {
    async func() {
      eventBus.$emit("runSpinner");

      eventBus.$emit("hideSpinner");
    }
  }
};
</script>