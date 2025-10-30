/// <reference types="cypress" />

// This test checks the responsiveness of the All Filtering Terms button.
// It verifies that the button changes style when clicked
// and that the Filtering Terms table renders with the expected headers.

import config from "../../../src/config/config.json";

describe("All Filtering Terms button behavior", () => {
  const primaryDarkColor = config.ui.colors.darkPrimary;

  // Helper: convert HEX → RGB
  const hexToRgb = (hex) => {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const primaryRgb = hexToRgb(primaryDarkColor);

  // Hard-coded expected table headers (from FilteringTermsTable)
  const expectedHeaders = ["Select", "ID", "Label", "Scope"];

  beforeEach(() => {
    cy.visit("/");
  });

  it("should change border color and render Filtering Terms table with correct headers", () => {
    // Find and click the button
    cy.contains("button", "All Filtering Terms")
      .as("filterBtn")
      .should("exist")
      .click();

    // Verify border color change
    cy.get("@filterBtn")
      .should("have.css", "border-color")
      .and("eq", primaryRgb);

    // Wait for Filtering Terms section
    cy.contains("p", "Filtering Terms", { timeout: 10000 })
      .should("be.visible")
      .and(($p) => {
        expect($p.closest("div[class*='MuiBox-root']")).to.exist;
      });

    // Wait for the table
    cy.get("table", { timeout: 10000 }).should("be.visible");

    // Verify that all expected headers are visible
    expectedHeaders.forEach((header) => {
      cy.contains("th", header, { matchCase: false }).should("be.visible");
    });

    // Optional: check total header count
    cy.get("thead th").should("have.length.at.least", expectedHeaders.length);
  });
});
