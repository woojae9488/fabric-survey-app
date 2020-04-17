<template>
  <div class="ManagerSignup">
    <h2 class="pb-4">{{ title }}</h2>

    <b-card
      v-if="isCreatedFinish"
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
              <b-form-select
                id="user-departments"
                v-model="registerData.departments"
                :options="departmentList"
                select-size="5"
                multiple
                required
              ></b-form-select>
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
import authService from '@/services/authApi';
import departmentService from '@/services/departmentApi';
import eventBus from '@/utils/eventBus';

export default {
  name: 'ManagerSignup',
  data() {
    return {
      title: 'Register JNU survey manager',
      isCreatedFinish: false,
      idChecked: false,
      departmentList: [],
      registerData: {
        id: '',
        departments: [],
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
  async created() {
    try {
      eventBus.$emit('runSpinner');
      await this.fillDepartmentList();
    } catch (err) {
      console.log(api.getErrorMsg(err));
      alert('Fail to lookup department List');
    } finally {
      eventBus.$emit('hideSpinner');
    }

    this.isCreatedFinish = true;
  },
  methods: {
    async fillDepartmentList() {
      const departmentsRes = await departmentService.queryAll();
      const departmentsData = api.getResultData(departmentsRes);
      departmentsData.forEach(department => {
        this.departmentList.push(department.name);
      });
    },

    async checkIdExists() {
      try {
        eventBus.$emit('runSpinner');

        const apiRes = await authService.checkExistence(this.registerData.id);
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

        await authService.signup(
          this.registerData.id,
          this.registerData.password,
          'manager',
          this.registerData.departments,
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
