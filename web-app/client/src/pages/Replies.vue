<template>
  <div class="Survey">
    <h2 class="pb-4">{{title}}</h2>

    <b-container fluid></b-container>
  </div>
</template>

<script>
import api from "@/services/api.js";
import replyService from "@/services/replyApi.js";
import eventBus from "@/utils/eventBus.js";

export default {
  name: "Replies",
  props: ["department", "surveyCreatedAt"],
  async created() {
    eventBus.$emit("runSpinner");
  },
  data() {
    return {};
  },
  computed: {},
  methods: {}
};
</script>