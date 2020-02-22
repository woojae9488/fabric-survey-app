<template>
  <div class="container">
    <h1>Signin</h1>
    <form @submit.prevent="signin">
      <label>
        <input type="radio" v-model="loginData.role" name="role" value="student" />학생
      </label>
      <label>
        <input type="radio" v-model="loginData.role" name="role" value="manager" />관리인
      </label>
      <br />
      <br />
      <table>
        <tr>
          <td>
            <label for="userId">ID :</label>
          </td>
          <td>
            <input type="text" v-model="loginData.id" id="userId" required />
          </td>
        </tr>
        <tr>
          <td>
            <label for="userPw">PASSWORD :</label>
          </td>
          <td>
            <input type="password" v-model="loginData.password" id="userPw" required />
          </td>
        </tr>
      </table>
      <br />
      <input type="submit" value="Signin" />
      <br />
    </form>
    <router-link v-if="isStudent" to="/StudentSignup">Signup</router-link>
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