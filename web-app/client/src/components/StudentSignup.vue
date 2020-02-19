<template>
  <div class="container">
    <h1>Signup</h1>
    <form @submit.prevent="signup">
      <label>
        학생증:
        <input type="file" accept="image/*" @change="showImgPreview" required />
      </label>
      <div>
        <img v-if="checkStudentCard" :src="studentCardSrc" width="300" alt="student Identify card" />
        <table v-if="checkCardData">
          <tr>
            <td>학번:</td>
            <td>{{registerData.studentId}}</td>
          </tr>
          <tr>
            <td>이름:</td>
            <td>{{registerData.name}}</td>
          </tr>
          <tr>
            <td>학과:</td>
            <td>{{registerData.department}}</td>
          </tr>
        </table>
      </div>
      <br />
      <br />
      <table>
        <tr>
          <td>
            <label for="userPw">PASSWORD :</label>
          </td>
          <td>
            <input type="password" v-model="registerData.password" id="userPw" />
          </td>
        </tr>
        <tr>
          <td>
            <label for="pwConfirm">CONFIRM :</label>
          </td>
          <td>
            <input type="password" v-model="registerData.passwordConfirm" id="pwConfirm" />
          </td>
        </tr>
      </table>
      <br />
      <input type="submit" value="Signup" />
      <br />
    </form>
    <vue-instant-loading-spinner id="loader" ref="Spinner"></vue-instant-loading-spinner>
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import VueInstantLoadingSpinner from "vue-instant-loading-spinner/src/components/VueInstantLoadingSpinner.vue";

export default {
  name: "StudentSignup",
  data() {
    return {
      studentCardSrc: "",
      registerData: {
        studentId: "",
        name: "",
        department: "",
        password: "",
        passwordConfirm: ""
      }
    };
  },
  computed: {
    checkStudentCard() {
      return this.studentCardSrc !== "";
    },
    checkCardData() {
      return (
        this.registerData.studentId &&
        this.registerData.name &&
        this.registerData.department
      );
    }
  },
  components: {
    VueInstantLoadingSpinner
  },
  methods: {
    async showImgPreview(event) {
      await this.runSpinner();

      const imgFile = event.target.files[0];
      if (!imgFile.type.match("image/.*")) {
        alert("Only image files can be uploaded");
        await this.hideSpinner();
        return;
      }

      const reader = new FileReader();
      reader.onload = async e => {
        this.studentCardSrc = e.target.result;

        try {
          const cardData = await new Object(
            new Object(
              JSON.parse('{"id":"200000","name":"ooo","department":"oooooooo"}')
            )
          ); // hack: need openCV recognition
          this.registerData.studentId = cardData.id;
          this.registerData.name = cardData.name;
          this.registerData.department = cardData.department;
        } catch (err) {
          console.log(api.getErrorMsg(err));
          alert("Read card data fail");
        } finally {
          await this.hideSpinner();
        }
      };
      reader.readAsDataURL(imgFile);
    },

    async signup() {
      await this.runSpinner();

      try {
        if (
          !this.checkCardData ||
          !this.registerData.password ||
          !this.registerData.passwordConfirm
        ) {
          alert("You must complete Student Card, PW, Confirm fields");
        }
        if (this.registerData.password !== this.registerData.passwordConfirm) {
          alert("Password confirm mismatch");
        }

        await userService.signup(
          "student",
          this.registerData.studentId,
          this.registerData.password,
          this.registerData.name,
          this.registerData.department
        );

        this.$router.push("/Signin");
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert("Signup fail");
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