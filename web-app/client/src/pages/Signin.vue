<template>
  <div class="Signin">
    <h2 class="pb-4">{{title}}</h2>

    <b-card
      header="Signin"
      header-tag="h5"
      border-variant="success"
      header-border-variant="success"
      align="left"
    >
      <b-container fluid>
        <b-form @submit.prevent="signin">
          <b-row class="my-2">
            <b-col sm="3">
              <b-form-radio-group
                id="role-radio-group"
                v-model="loginData.role"
                :options="roleOptions"
                name="role-radios"
                size="sm"
                buttons
              ></b-form-radio-group>
            </b-col>
          </b-row>

          <b-row class="my-3" align-v="center">
            <b-col sm="3">
              <label for="user-id">ID :</label>
            </b-col>
            <b-col sm="9">
              <b-form-input
                id="user-id"
                v-model="loginData.id"
                placeholder="Enter your ID"
                trim
                required
              ></b-form-input>
            </b-col>
          </b-row>

          <b-row class="my-3" align-v="center">
            <b-col sm="3">
              <label for="user-password">PASSWORD :</label>
            </b-col>
            <b-col sm="9">
              <b-form-input
                type="password"
                id="user-password"
                v-model="loginData.password"
                placeholder="Enter your Password"
                trim
                required
              ></b-form-input>
            </b-col>
          </b-row>

          <b-row class="my-4" align-h="center">
            <b-col sm="12">
              <b-button type="submit" variant="primary">Signin</b-button>
            </b-col>
          </b-row>

          <b-row v-if="isStudent" class="my-1" align-h="center">
            <b-col sm="12">
              <b-link to="/StudentSignup">Signup</b-link>
            </b-col>
          </b-row>
        </b-form>
      </b-container>
    </b-card>
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import eventBus from "@/utils/eventBus.js";

export default {
  name: "Signin",
  created() {
    if (api.getData("accessToken") && api.getData("refreshToken")) {
      this.$router.push("/SurveyList");
    }
  },
  data() {
    return {
      title: "Welcome to JNU Survey App",
      roleOptions: ["student", "manager"],
      loginData: {
        role: "student",
        id: "",
        password: ""
      }
    };
  },
  computed: {
    isStudent() {
      return this.loginData.role === "student";
    }
  },
  methods: {
    async signin() {
      eventBus.$emit("runSpinner");

      try {
        const apiRes = await userService.signin(
          this.loginData.role,
          this.loginData.id,
          this.loginData.password
        );

        const apiData = api.getResultData(apiRes);
        api.setData("role", this.loginData.role);
        api.setData("accessToken", apiData.accessToken);
        api.setData("refreshToken", apiData.refreshToken);

        this.$router.push("/SurveyList");
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert("Signin fail");
      } finally {
        eventBus.$emit("hideSpinner");
      }
    }
  }
};
</script>