/// <reference types="cypress" />

import config from "../../../src/config/config.json";

// This test verifies the All Filtering Terms feature.
// It checks that the button updates its style when selected and ensures the filtering terms table renders properly.
// It validates that all expected table headers are visible in the UI.
// It fetches filtering terms from the backend and confirms that every backend term appears in the UI table.
// It also navigates through paginated results to ensure nothing is missing across all pages.

describe("All Filtering Terms behavior and backend consistency", () => {
  const primaryDarkColor = config.ui.colors.darkPrimary;

  // Helper: convert HEX → RGB
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return `rgb(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${
      bigint & 255
    })`;
  };

  const primaryRgb = hexToRgb(primaryDarkColor);
  const expectedHeaders = ["Select", "ID", "Label", "Scope"];

  beforeEach(() => {
    cy.visit("/");
  });

  it("changes border color and renders Filtering Terms table with correct headers", () => {
    cy.contains("button", "All Filtering Terms")
      .as("filterBtn")
      .should("exist")
      .click();

    cy.get("@filterBtn")
      .should("have.css", "border-color")
      .and("eq", primaryRgb);

    cy.contains("p", "Filtering Terms", { timeout: 10000 }).should(
      "be.visible"
    );

    cy.get("table", { timeout: 10000 }).should("be.visible");

    expectedHeaders.forEach((header) => {
      cy.contains("th", header, { matchCase: false }).should("be.visible");
    });

    cy.get("thead th").should("have.length.at.least", expectedHeaders.length);
  });

  it("displays all filtering terms returned by the backend", () => {
    const endpoint = `${config.apiUrl}/filtering_terms?limit=0`;

    // Step 1: Fetch backend filtering terms
    cy.request(endpoint).then((res) => {
      const backendTerms = res.body?.response?.filteringTerms || [];
      expect(backendTerms.length).to.be.greaterThan(0);

      // Step 2: Open UI filtering terms
      cy.contains("button", "All Filtering Terms").click({ force: true });

      cy.contains("p", "Filtering Terms", { timeout: 10000 }).should(
        "be.visible"
      );

      // Step 3: Collect filtering term IDs from all pages
      const uiIds = new Set();

      function collectPage() {
        cy.get('[data-cy="filtering-term-id"]').each(($el) => {
          uiIds.add($el.text().trim());
        });

        cy.get("body").then(($body) => {
          const nextButton = $body.find(
            'button[aria-label="Go to next page"]:not(:disabled)'
          );

          if (nextButton.length > 0) {
            cy.get('button[aria-label="Go to next page"]')
              .click({ force: true })
              .then(() => collectPage());
          }
        });
      }

      collectPage();

      cy.then(() => {
        const backendIds = backendTerms.map((t) => t.id);

        backendIds.forEach((id) => {
          expect([...uiIds]).to.include(
            id,
            `Filtering term '${id}' is missing from UI`
          );
        });
      });
    });
  });

  it("searches filtering terms and returns correct results", () => {
    // Open Filtering Terms
    cy.contains("button", "All Filtering Terms").click({ force: true });

    // Wait for the section to become visible
    cy.contains("p", "Filtering Terms", { timeout: 10000 }).should(
      "be.visible"
    );

    // Store initial list of IDs before searching
    let allUiIds = [];

    cy.get('[data-cy="filtering-term-id"]', { timeout: 10000 })
      .then(($cells) => {
        allUiIds = [...$cells].map((el) => el.innerText.trim());
        expect(allUiIds.length).to.be.greaterThan(0);
      })
      .then(() => {
        // 1. Search for a known prefix
        const searchTerm = "HP";

        cy.get("input[placeholder='Search Filtering Terms']")
          .should("exist")
          .clear()
          .type(searchTerm, { delay: 20 });

        // All visible IDs should match the search query
        cy.get('[data-cy="filtering-term-id"]').each(($id) => {
          expect($id.text().trim()).to.include(searchTerm);
        });
      })
      .then(() => {
        // 2. Search for a value that does not exist
        cy.get("input[placeholder='Search Filtering Terms']")
          .clear()
          .type("ZZZ_DOES_NOT_EXIST", { delay: 10 });

        // The table should show exactly one row for the error message
        cy.get('[data-cy="filtering-term-row"]').should("have.length", 1);

        // Check that the error message text is correct
        cy.contains("No match found. Try another filter.")
          .should("be.visible")
          .and("have.class", "MuiAlert-message");
      })
      .then(() => {
        // 3. Clear the search and confirm the original list is restored
        cy.get('button:has(svg[data-testid="CloseIcon"])').click({
          force: true,
        });

        cy.get('[data-cy="filtering-term-id"]', { timeout: 5000 }).then(
          ($cells) => {
            const restoredIds = [...$cells].map((el) => el.innerText.trim());
            expect(restoredIds.length).to.equal(
              allUiIds.length,
              "Clearing the search should restore all filtering terms"
            );
          }
        );
      });
  });

  it("finds the first multi-scope filtering term across all pages and changes scope", () => {
    cy.contains("button", "All Filtering Terms").click({ force: true });
    cy.contains("p", "Filtering Terms", { timeout: 10000 }).should(
      "be.visible"
    );

    let found = false;

    function scanPage() {
      cy.get('[data-cy="filtering-term-scope"]', { timeout: 10000 })
        .should("have.length.greaterThan", 0)
        .then(($cells) => {
          const multiScopeCell = [...$cells].find(
            (cell) =>
              cell.querySelectorAll('[data-cy^="scope-pill"]').length > 1
          );

          if (multiScopeCell) {
            found = true;

            const pills = multiScopeCell.querySelectorAll(
              '[data-cy="scope-pill"]'
            );

            const pillText = pills[0].innerText.trim();

            cy.wrap(pills[0]).click({ force: true });

            cy.wrap(multiScopeCell)
              .find('[data-cy="scope-pill-selected"]', { timeout: 10000 })
              .should("contain.text", pillText);

            return;
          }

          cy.get("body").then(($body) => {
            const nextBtn = $body.find(
              'button[aria-label="Go to next page"]:not(:disabled)'
            );

            if (nextBtn.length > 0) {
              cy.get('button[aria-label="Go to next page"]').click({
                force: true,
              });
              scanPage();
            }
          });
        });
    }

    scanPage();

    cy.then(() => {
      if (!found) {
        cy.log("No multi-scope filtering term found.");
      }
    });
  });
});
