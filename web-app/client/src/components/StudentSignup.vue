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
            <td>{{registerData.id}}</td>
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
            <input type="password" v-model="registerData.password" id="userPw" required />
          </td>
        </tr>
        <tr>
          <td>
            <label for="pwConfirm">CONFIRM :</label>
          </td>
          <td>
            <input type="password" v-model="registerData.passwordConfirm" id="pwConfirm" required />
          </td>
        </tr>
      </table>
      <br />
      <input type="submit" value="Signup" />
      <br />
    </form>
  </div>
</template>

<script>
import api from "@/services/api.js";
import userService from "@/services/userApi.js";
import eventBus from "@/utils/eventBus.js";

export default {
  name: "StudentSignup",
  data() {
    return {
      studentCardSrc: "",
      registerData: {
        role: "",
        id: "",
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
        this.registerData.role &&
        this.registerData.id &&
        this.registerData.name &&
        this.registerData.department
      );
    }
  },
  methods: {
    async showImgPreview(event) {
      eventBus.$emit("runSpinner");

      const imgFile = event.target.files[0];
      if (!imgFile.type.match("image/.*")) {
        alert("Only image files can be uploaded");
        eventBus.$emit("hideSpinner");
        return;
      }

      const reader = new FileReader();
      reader.onload = async e => {
        this.studentCardSrc = e.target.result;

        try {
          const cardData = await new Object(
            JSON.parse(
              '{"role":"student","id":"200000","name":"ooo","department":"oooooooo"}'
            )
          ); // hack: need openCV recognition
          this.registerData.role = cardData.role;
          this.registerData.id = cardData.id;
          this.registerData.name = cardData.name;
          this.registerData.department = cardData.department;
        } catch (err) {
          console.log(api.getErrorMsg(err));
          alert("Read card data fail");
        } finally {
          eventBus.$emit("hideSpinner");
        }
      };
      reader.readAsDataURL(imgFile);
    },

    async signup() {
      eventBus.$emit("runSpinner");

      try {
        if (this.registerData.password !== this.registerData.passwordConfirm) {
          alert("Password confirm mismatch");
          return;
        }

        await userService.signup(
          this.registerData.role,
          this.registerData.id,
          this.registerData.password,
          this.registerData.name,
          ["jnu", this.registerData.department]
        );

        this.$router.push("/Signin");
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert("Signup fail");
      } finally {
        eventBus.$emit("hideSpinner");
      }
    }
  }
};
</script>