/// <reference types="cypress" />

describe("Beacon type rendering", () => {
  let beaconType = null;

  before(() => {
    // Load the real config file directly from the app
    cy.readFile("src/config/config.json").then((config) => {
      beaconType = config.beaconType;
      cy.log(`Detected beaconType: ${beaconType}`);
    });
  });

  it("should show the Single Beacon Banner tabs when beaconType is singleBeacon", () => {
    // Only run the UI checks if beaconType is singleBeacon
    if (beaconType !== "singleBeacon") {
      cy.log("Skipping test because beaconType is not singleBeacon");
      return;
    }

    cy.visit("/");

    // Wait a bit for the banner to render (Beacon Info + Datasets tabs)
    cy.contains("Beacon Information", { timeout: 15000 }).should("be.visible");
    cy.contains("Datasets Information", { timeout: 15000 }).should(
      "be.visible"
    );
  });
});
