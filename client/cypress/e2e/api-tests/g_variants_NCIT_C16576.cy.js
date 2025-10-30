/// <reference types="cypress" />

describe("g_variants — NCIT:C16576 consistency check", () => {
  const apiUrl =
    "https://beacon-network-backend-test.ega-archive.org/api/g_variants";

  const query = {
    meta: { apiVersion: "2.0" },
    query: {
      filters: [{ id: "NCIT:C16576", scope: "individual" }],
      includeResultsetResponses: "HIT",
      pagination: { skip: 0, limit: 10 },
      testMode: false,
      requestedGranularity: "record",
    },
  };

  it("compares backend response with UI table", () => {
    // STEP 1: Detect entry type from apiUrl
    const entryType = apiUrl.split("/").pop();
    const entryTypeLabel =
      entryType === "g_variants"
        ? "Genomic Variants"
        : entryType.charAt(0).toUpperCase() + entryType.slice(1);

    cy.log(`Detected entry type: ${entryTypeLabel}`);

    // STEP 2: Fetch backend data
    cy.request({
      method: "POST",
      url: apiUrl,
      body: query,
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      const backend = res.body;
      const backendResultSets = backend?.response?.resultSets || [];
      const backendIds = backendResultSets
        .map((set) => set.id?.toString().toLowerCase())
        .filter(Boolean);

      cy.log(
        `Backend resultSets IDs: ${JSON.stringify(backendIds.slice(0, 5))}`
      );
      cy.wrap(backendIds).as("backendIds");

      // STEP 3: Open the application
      cy.visit("/");

      // STEP 4: Select correct entry type in UI
      cy.contains("button", entryTypeLabel, { timeout: 20000 })
        .should("be.visible")
        .click();

      cy.contains("button", entryTypeLabel)
        .should("have.css", "background-color")
        .then((bg) => {
          expect(bg).not.to.eq("rgb(255, 255, 255)");
        });

      // STEP 5: If query has filters, add and verify them
      const filters = query.query.filters || [];
      if (filters.length > 0) {
        filters.forEach((filter) => {
          const filterId = filter.id;
          let label;
          let idText;

          // Type filter ID in "Search by Filtering Terms" input
          cy.get('[data-testid="filtering-input"]', { timeout: 15000 })
            .should("be.visible")
            .click()
            .type(filterId, { delay: 100 });

          // Wait for dropdown and select first item
          cy.get(".MuiListItem-root", { timeout: 20000 })
            .should("have.length.greaterThan", 0)
            .first()
            .within(() => {
              cy.get("div").then(($divs) => {
                if ($divs.length < 2) {
                  throw new Error("Dropdown item missing expected columns");
                }

                label = $divs.first().text().trim();
                idText = $divs.last().text().trim();

                cy.wrap($divs.last().closest(".MuiListItem-root")).click({
                  force: true,
                });
              });
            });

          // STEP 6: Verify filter appears in "Query Applied" section
          cy.wait(1000);
          cy.get('[data-cy="query-applied-container"]', {
            timeout: 20000,
          }).should("be.visible");

          cy.get('[data-cy="filter-chip"]').then(($chips) => {
            const texts = [...$chips].map((el) =>
              el.innerText.trim().toLowerCase()
            );
            const cleanLabel = label?.toLowerCase().split(" | ")[0].trim();
            const cleanId = idText?.toLowerCase().trim();

            const foundLabel = texts.some((t) => t.includes(cleanLabel));
            const foundId = texts.some((t) => t.includes(cleanId));

            if (!foundLabel && !foundId) {
              throw new Error(
                `Filter not found — label="${cleanLabel}", id="${cleanId}", chips=${texts}`
              );
            }

            // Expand filter to access scopes
            cy.get('[data-cy="filter-chip"]')
              .contains(label.split(" | ")[0].trim(), { matchCase: false })
              .click({ force: true });
          });

          // STEP 7: Select correct scope from query
          const expectedScope = filter.scope;
          if (expectedScope) {
            cy.get('[data-cy="scope-selector-title"]', { timeout: 10000 })
              .should("be.visible")
              .then(() => {
                cy.get('[data-cy="scope-selector-title"]')
                  .parent()
                  .find("button")
                  .then(($buttons) => {
                    const scopesAvailable = [...$buttons].map((b) =>
                      b.innerText.trim().toLowerCase()
                    );

                    const found = scopesAvailable.includes(
                      expectedScope.toLowerCase()
                    );
                    expect(found, `Scope '${expectedScope}' not found`).to.be
                      .true;

                    cy.get("button")
                      .contains(new RegExp(`^${expectedScope}$`, "i"))
                      .click({ force: true });

                    // STEP 8: Trigger search
                    cy.get('[data-cy="search-button"]')
                      .should("be.visible")
                      .click({ force: true });

                    // STEP 9: Compare backend vs frontend IDs
                    cy.get("@backendIds").then((backendIds) => {
                      cy.get('[data-cy="results-table"]', { timeout: 30000 })
                        .should("be.visible")
                        .and("not.contain.text", "Loading");

                      cy.get('[data-cy="results-table-id-value"]')
                        .should("have.length.greaterThan", 0)
                        .then(($cells) => {
                          const uiIds = [...$cells].map((el) =>
                            el.innerText.trim().toLowerCase()
                          );

                          const matched = backendIds.some((id) =>
                            uiIds.some((ui) => ui.includes(id))
                          );

                          if (!matched) {
                            throw new Error(
                              `No backend resultSet.id found in UI.
                                 Backend IDs: ${backendIds.join(", ")}
                                 UI IDs: ${uiIds.join(", ")}`
                            );
                          }
                        });

                      // STEP 10: Capture totalResultsCount values
                      cy.get('[data-cy="results-table-total-results"]').then(
                        ($cells) => {
                          const values = [...$cells].map((el) =>
                            parseInt(el.innerText.replace(/[^\d]/g, ""), 10)
                          );
                          cy.log(`UI totalResultsCount values: ${values}`);
                        }
                      );
                    });
                  });
              });
          }
        });
      }
    });
  });
});
