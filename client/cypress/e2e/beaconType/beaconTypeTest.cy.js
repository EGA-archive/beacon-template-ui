/// <reference types="cypress" />

describe("Beacon type rendering", () => {
  let beaconType = null;

  before(() => {
    // Load the runtime config served by the app
    cy.request("/config/config.json").then((response) => {
      beaconType = response.body.beaconType;
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
