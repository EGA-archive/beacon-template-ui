/// <reference types="cypress" />

describe("Beacon Network rendering", () => {
  let beaconType = null;

  before(() => {
    cy.readFile("src/config/config.json").then((config) => {
      beaconType = config.beaconType;
      cy.log(`Detected beaconType: ${beaconType}`);
    });
  });

  it("should show the Beacon Network Members banner and navbar link when beaconType is networkBeacon", () => {
    if (beaconType !== "networkBeacon") {
      cy.log("Skipping test because beaconType is not networkBeacon");
      return;
    }

    cy.visit("/");

    // 1️. Check for the banner
    cy.contains("Beacon Network Members", { timeout: 1500 }).should(
      "be.visible"
    );

    // 2️. Check that the navbar has "Network Members"
    cy.get('[data-cy="navbar-links"]', { timeout: 1000 })
      .contains("Network Members")
      .should("be.visible");
  });
});
