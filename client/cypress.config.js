const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000/",
    setupNodeEvents(on, config) {
      require("@cypress/code-coverage/task")(on, config);
      return config;
    },
    video: true,
    videosFolder: "cypress/videos",
    screenshotOnRunFailure: true,
  },
  viewportWidth: 1280,
  viewportHeight: 720,
});
