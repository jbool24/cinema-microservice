export default {
  name: 'notifications',

  settings: {},

  dependencies: [],

  async created() {
    this.app = await start(this);
  }
}
