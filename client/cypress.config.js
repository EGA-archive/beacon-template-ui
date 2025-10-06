const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    video: true,
    videosFolder: "cypress/videos",
    screenshotOnRunFailure: true,
  },
  viewportWidth: 1280,
  viewportHeight: 720,
});
