/// <reference types="cypress" />

// Verify that the Allele Frequency search filter has been removed
// without affecting the existing genomic search suggestions.

describe("Allele Frequency filter removal", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  const getGenomicInput = () =>
    cy
      .get(
        'input[placeholder^="Examples:"], input[placeholder="Enter genomic variant"]',
        { timeout: 10000 }
      )
      .filter(":visible")
      .first();

  ["AF", "Allele Frequency", "alele frequency"].forEach((value) => {
    it(`does not suggest the AF filter when typing "${value}"`, () => {
      getGenomicInput().clear().type(value);

      // The removed AF-specific suggestion must not appear.
      cy.contains("Add Allele Frequency").should("not.exist");

      // The existing Genomic Query Builder suggestion remains.
      cy.contains("Open Genomic Query Builder").should("be.visible");
    });
  });

  it("preserves genomic search suggestions", () => {
    getGenomicInput().clear().type("BRCA1");

    cy.contains("Add Allele Frequency").should("not.exist");
    cy.contains("Open Genomic Query Builder").should("be.visible");
  });
});
