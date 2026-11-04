/// <reference types="cypress" />

// General smoke tests for the Beacon Template UI.
// Verify that essential frontend functionality remains available.

describe("BTUI general smoke tests", () => {
  const getGenomicInput = () =>
    cy
      .get(
        'input[placeholder^="Examples:"], input[placeholder="Enter genomic variant"]',
        { timeout: 10000 }
      )
      .filter(":visible")
      .first();

  beforeEach(() => {
    cy.visit("/");
  });

  it("loads the homepage successfully", () => {
    cy.get("body").should("be.visible");

    cy.contains("button", "All Filtering Terms").should("exist");

    getGenomicInput().should("be.visible");
  });

  it("loads a valid runtime configuration", () => {
    cy.request("/config/config.json").then(({ status, body }) => {
      expect(status).to.equal(200);

      expect(body).to.have.property("apiUrl");
      expect(body.apiUrl).to.be.a("string").and.not.be.empty;

      expect(body).to.have.property("ui");
      expect(body.ui).to.have.property("colors");
    });
  });

  it("accepts a genomic search input", () => {
    getGenomicInput().type("BRCA1");

    getGenomicInput().should("have.value", "BRCA1");

    cy.contains("Open Genomic Query Builder").should("be.visible");
  });

  it("clears the genomic input and hides suggestions", () => {
    getGenomicInput().type("BRCA1");

    cy.contains("Open Genomic Query Builder").should("be.visible");

    getGenomicInput().clear();

    getGenomicInput().should("have.value", "");

    cy.contains("Open Genomic Query Builder").should("not.exist");
  });
});
