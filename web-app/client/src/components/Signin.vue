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
      <input type="submit" value="Signin" />
      <br />
    </form>
    <router-link v-if="isStudent" to="/StudentSignup">Signup</router-link>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "Signin",
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
    async signin() {
      await this.runSpinner();

      try {
        if (!this.loginData.id || !this.loginData.password) {
          alert("You must complete both ID and PW fields");
        }

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
        alert("Signin fail");
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