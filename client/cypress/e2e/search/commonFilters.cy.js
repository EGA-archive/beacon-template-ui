/// <reference types="cypress" />

// Regression tests for Common Filters after AF filter removal.

describe("Common Filters", () => {
  // Select an alphanumeric filter from the backend.
  const openAlphanumericFilter = () => {
    cy.request("/config/config.json").then(({ body: config }) => {
      cy.request(`${config.apiUrl}/filtering_terms?limit=0`).then(
        ({ body }) => {
          const terms = body.response?.filteringTerms || [];
          const term = terms.find(
            (item) => item.type?.toLowerCase() === "alphanumeric"
          );

          const availableTypes = [...new Set(terms.map((item) => item.type))];

          expect(
            term,
            `Alphanumeric filter. Found ${
              terms.length
            } terms with types: ${availableTypes.join(", ")}`
          ).to.exist;

          cy.contains("button", "All Filtering Terms").click();

          cy.get('input[placeholder="Search Filtering Terms"]')
            .clear()
            .type(term.id, { parseSpecialCharSequences: false });

          cy.contains('[data-cy="filtering-term-id"]', term.id)
            .closest("tr")
            .click();
        }
      );
    });
  };

  beforeEach(() => {
    cy.visit("/");
  });

  it("opens the value input for an alphanumeric filter", () => {
    openAlphanumericFilter();

    cy.contains("Insert value for").should("be.visible");
    cy.get('input[placeholder="Value"]').should("be.visible");
  });

  it("displays the available comparison operators", () => {
    openAlphanumericFilter();

    cy.get("#select-value").click();

    ["contains", "does not contain"].forEach((operator) => {
      cy.contains('[role="option"]', operator).should("exist");
    });
  });

  it("adds an alphanumeric filter", () => {
    openAlphanumericFilter();

    cy.get('input[placeholder="Value"]').type("test123");

    cy.get('[data-cy="extra-filter-add"]').click();

    // Value input disappears after successful addition.
    cy.get('input[placeholder="Value"]').should("not.exist");

    // Added filter appears in the applied filters.
    cy.contains("test123").should("exist");
  });
});
