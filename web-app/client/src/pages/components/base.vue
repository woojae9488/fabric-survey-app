<template>
  <div class="class">
    <h2 class="pb-4">{{title}}</h2>
  </div>
</template>

<script>
import api from "@/services/api.js";
import eventBus from "@/utils/eventBus.js";

export default {
  name: "",
  props: ["", ""],
  data() {
    return {
      title: ""
    };
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