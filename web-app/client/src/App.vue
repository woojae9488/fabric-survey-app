<template>
  <div id="app">
    <img src="./assets/logo.png" alt="logo" width="50px" />
    <p>
      <router-link to="/Signin">Signin</router-link>&nbsp;
      <router-link to="/SurveyList">SurveyList</router-link>&nbsp;
    </p>

    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app"
};
</script>