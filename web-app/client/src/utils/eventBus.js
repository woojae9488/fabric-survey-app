import Vue from 'vue'

const eventBus = new Vue()
export default eventBus
// bus.$emit(eventName, {argument})
// bus.$on(eventName, (e) => {processing e})