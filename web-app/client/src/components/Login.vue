<template>
  <div class="container">
    <h1>login</h1>
    <form @submit="login">
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
            <input type="text" v-model="loginData.id" id="userId" />
          </td>
        </tr>
        <tr>
          <td>
            <label for="userPw">PASSWORD :</label>
          </td>
          <td>
            <input type="password" v-model="loginData.password" id="userPw" />
          </td>
        </tr>
      </table>
      <br />
      <input type="submit" value="Login" />
      <br />
      <router-link v-if="isStudent" to="/StudentSignup">Register</router-link>
    </form>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "Login",
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
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async login() {
      await this.runSpinner();

      try {
        const apiRes = await userService.signin(
          this.loginData.role,
          this.loginData.id,
          this.loginData.password
        );

        const apiData = api.getResultData(apiRes);
        api.setCookie("accessToken", apiData.accessToken);
        api.setCookie("refreshToken", apiData.refreshToken);
        this.$router.push("/SurveyList");
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert("Login fail");
      } finally {
        await this.hideSpinner();
      }
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