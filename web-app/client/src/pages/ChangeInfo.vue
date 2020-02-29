<template>
  <div class="ChangeInfo">
    <h2 class="pb-4">{{ title }}</h2>

    <b-card
      header="Change User Information"
      header-tag="h5"
      border-variant="success"
      header-border-variant="success"
      align="left"
    >
      <b-container fluid>
        <b-form @submit.prevent="changeInfo">
          <b-row class="my-2">
            <b-col sm="2">Id :</b-col>
            <b-col sm="4">{{ userData.id }}</b-col>
            <b-col sm="2">Name :</b-col>
            <b-col sm="4">{{ userData.name }}</b-col>
          </b-row>

          <b-row class="mt-2 mb-4">
            <b-col sm="3">Departments :</b-col>
            <b-col sm="4">{{ departmentsStr }}</b-col>
          </b-row>

          <b-row class="my-3" align-v="center">
            <b-col sm="3">
              <label for="user-new-password">New Password :</label>
            </b-col>
            <b-col sm="9">
              <b-form-input
                id="user-new-password"
                v-model="changeData.password"
                type="password"
                :state="passwordState"
                aria-describedby="input-live-feedback"
                placeholder="Enter your New Password"
                trim
                required
              />
              <b-form-invalid-feedback id="password-live-feedback"
                >Enter at least 8 letters</b-form-invalid-feedback
              >
            </b-col>
          </b-row>

          <b-row class="my-3" align-v="center">
            <b-col sm="3">
              <label for="user-new-password-confirm">Confirm :</label>
            </b-col>
            <b-col sm="9">
              <b-form-input
                type="password"
                id="user-new-password-confirm"
                v-model="changeData.passwordConfirm"
                :state="passwordConfirmState"
                placeholder="Enter your New Password again"
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
              <b-button type="submit" variant="primary">Change</b-button>
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
  name: 'ChangeInfo',
  created() {
    this.userData = api.getData('user');
    this.userData.role = api.getData('role');
  },
  data() {
    return {
      title: 'Change your information',
      userData: {},
      changeData: {
        password: '',
        passwordConfirm: '',
      },
    };
  },
  computed: {
    departmentsStr() {
      return String(this.userData.departments);
    },
    passwordState() {
      return this.changeData.password.length === 0 ? null : !(this.changeData.password.length < 8);
    },
    passwordConfirmState() {
      return this.changeData.passwordConfirm.length === 0
        ? null
        : !(this.changeData.passwordConfirm.length < 8);
    },
  },
  methods: {
    async changeInfo() {
      eventBus.$emit('runSpinner');

      try {
        if (this.changeData.password !== this.changeData.passwordConfirm) {
          alert('Password confirm mismatch');
          return;
        }

        await userService.changeInfo(
          this.userData.role,
          this.userData.id,
          this.changeData.password,
          this.userData.name,
          this.userData.departments,
        );

        api.clearData();
        this.$router.push('/Signin');
      } catch (err) {
        console.log(api.getErrorMsg(err));
        alert('Change information fail');
      } finally {
        eventBus.$emit('hideSpinner');
      }
    },
  },
};
</script>
