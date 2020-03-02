<template>
  <div class="ManagerSignup">
    <h2 class="pb-4">{{ title }}</h2>

    <b-card
      header="Manager Signup"
      header-tag="h5"
      border-variant="success"
      header-border-variant="success"
      align="left"
    >
      <b-container fluid>
        <b-form @submit.prevent="signup">
          <b-row class="my-3">
            <b-col sm="2">
              <label for="user-id">Id :</label>
            </b-col>
            <b-col sm="7">
              <b-form-input
                id="user-id"
                v-model="registerData.id"
                :state="idState"
                aria-describedby="input-live-feedback"
                placeholder="Enter your Id"
                trim
                required
              ></b-form-input>
              <b-form-invalid-feedback id="id-live-feedback"
                >Enter at least 6 letters and Check Id</b-form-invalid-feedback
              >
            </b-col>
            <b-col sm="3">
              <b-button @click="checkIdExists" variant="primary">Check Id</b-button>
            </b-col>
          </b-row>

          <b-row class="my-3">
            <b-col sm="3">
              <label for="user-departments">Departments :</label>
            </b-col>
            <b-col sm="6">
              <b-form-input
                id="user-departments"
                v-model="registerData.departments"
                placeholder="Enter your Departments separated by commas"
                trim
                required
              ></b-form-input>
            </b-col>
          </b-row>

          <b-row class="my-3" align-v="center">
            <b-col sm="3">
              <label for="user-password">Password :</label>
            </b-col>
            <b-col sm="9">
              <b-form-input
                type="password"
                id="user-password"
                v-model="registerData.password"
                :state="passwordState"
                aria-describedby="input-live-feedback"
                placeholder="Enter your Password"
                trim
                required
              ></b-form-input>
              <b-form-invalid-feedback id="password-live-feedback"
                >Enter at least 8 letters</b-form-invalid-feedback
              >
            </b-col>
          </b-row>

          <b-row class="my-3" align-v="center">
            <b-col sm="3">
              <label for="user-password-confirm">Confirm :</label>
            </b-col>
            <b-col sm="9">
              <b-form-input
                type="password"
                id="user-password-confirm"
                v-model="registerData.passwordConfirm"
                :state="passwordConfirmState"
                placeholder="Enter your Password again"
                trim
                required
              ></b-form-input>
              <b-form-invalid-feedback id="password-confirm-live-feedback"
                >Enter at least 8 letters</b-form-invalid-feedback
              >
            </b-col>
          </b-row>

          <b-row class="my-4" align="center">
            <b-col sm="1" offset-sm="4">
              <b-button type="submit" variant="primary">Signup</b-button>
            </b-col>
            <b-col sm="1" offset-sm="1">
              <b-button type="reset" variant="info">Reset</b-button>
            </b-col>
          </b-row>
        </b-form>
      </b-container>
    </b-card>
  </div>
</template>

<script>
import api from '@/services/api';
import userService from '@/services/userApi';
import eventBus from '@/utils/eventBus';

export default {
  name: 'ManagerSignup',
  data() {
    return {
      title: 'Register JNU survey manager',
      idChecked: false,
      registerData: {
        id: '',
        departments: '',
        password: '',
        passwordConfirm: '',
      },
    };
  },
  computed: {
    idState() {
      return this.registerData.id.length === 0
        ? null
        : !(this.registerData.id.length < 6 || !this.idChecked);
    },
    passwordState() {
      return this.registerData.password.length === 0
        ? null
        : !(this.registerData.password.length < 8);
    },
    passwordConfirmState() {
      return this.registerData.passwordConfirm.length === 0
        ? null
        : !(this.registerData.passwordConfirm.length < 8);
    },
  },
  methods: {
    async checkIdExists() {
      try {
        eventBus.$emit('runSpinner');

        const apiRes = await userService.checkExistence('manager', this.registerData.id);
        const apiData = api.getResultData(apiRes);

        if (apiData.userExists) {
          alert('Id already exists');
          this.idChecked = false;
        } else {
          this.idChecked = true;
        }
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert('Fail to check id');
      } finally {
        eventBus.$emit('hideSpinner');
      }
    },

    async signup() {
      try {
        eventBus.$emit('runSpinner');

        if (!this.idChecked) {
          alert('Check your id first');
          return;
        }
        if (this.registerData.password !== this.registerData.passwordConfirm) {
          alert('Password confirm mismatch');
          return;
        }

        let departments = this.registerData.departments.split(',');
        departments = departments.map(department => department.trim());
        await userService.signup(
          'manager',
          this.registerData.id,
          this.registerData.password,
          'manager',
          departments,
        );

        this.$router.push('/SurveyList');
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert('Fail to manager signup');
      } finally {
        eventBus.$emit('hideSpinner');
      }
    },
  },
};
</script>
