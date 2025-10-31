/// <reference types="cypress" />

describe("g_variants — NCIT:C16576 consistency check", () => {
  const apiUrl =
    "https://beacon-network-backend-test.ega-archive.org/api/g_variants";

  const query = {
    meta: { apiVersion: "2.0" },
    query: {
      filters: [{ id: "NCIT:C16576", scope: "individual" }],
      includeResultsetResponses: "HIT",
      pagination: { skip: 0, limit: 1000 },
      testMode: false,
      requestedGranularity: "record",
    },
  };

  it("compares backend variantInternalIds with UI table", () => {
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
      const resultSets = backend?.response?.resultSets || [];

      const backendVariantIds = resultSets.flatMap((set) =>
        (set.results || [])
          .map((r) => r.variantInternalId?.toString().toLowerCase())
          .filter(Boolean)
      );
      cy.wrap(backendVariantIds).as("backendVariantIds");
      // STEP 3: Open the application
      cy.visit("/");
      // STEP 4: Select correct entry type in UI from the apiUrl
      cy.contains("button", entryTypeLabel, { timeout: 20000 })
        .should("be.visible")
        .click();
      cy.contains("button", entryTypeLabel)
        .should("have.css", "background-color")
        .then((bg) => {
          expect(bg).not.to.eq("rgb(255, 255, 255)");
        });
      // STEP 5: Apply filters and verify
      const filters = query.query.filters || [];
      if (filters.length > 0) {
        filters.forEach((filter) => {
          const filterId = filter.id;
          let label;
          let idText;
          cy.get('[data-testid="filtering-input"]', { timeout: 15000 })
            .should("be.visible")
            .click()
            .type(filterId, { delay: 100 });
          cy.get(".MuiListItem-root", { timeout: 20000 })
            .should("have.length.greaterThan", 0)
            .first()
            .within(() => {
              cy.get("div").then(($divs) => {
                if ($divs.length < 2)
                  throw new Error("Dropdown item missing columns");

                label = $divs.first().text().trim();
                idText = $divs.last().text().trim();

                cy.wrap($divs.last().closest(".MuiListItem-root")).click({
                  force: true,
                });
              });
            });

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

            cy.get('[data-cy="filter-chip"]')
              .contains(label.split(" | ")[0].trim(), { matchCase: false })
              .click({ force: true });
          });

          // STEP 6: Select correct scope from query
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

                    // STEP 7: Trigger search
                    cy.get('[data-cy="search-button"]')
                      .should("be.visible")
                      .click({ force: true });

                    cy.get("@backendVariantIds").then((backendVariantIds) => {
                      cy.get('[data-cy="results-table"]', { timeout: 30000 })
                        .should("be.visible")
                        .and("not.contain.text", "Loading");

                      // STEP 8: Open details modal
                      cy.get('[data-cy="results-table-details-button"]', {
                        timeout: 10000,
                      })
                        .should("be.visible")
                        .first()
                        .click({ force: true });

                      const allVariantIds = [];

                      function collectVariantIdsAndPaginate() {
                        cy.get('[data-cy="variant-internal-id-cell"]', {
                          timeout: 20000,
                        })
                          .should("have.length.greaterThan", 0)
                          .then(($cells) => {
                            const uiVariantIds = [...$cells].map((el) =>
                              el.innerText.trim().toLowerCase()
                            );
                            allVariantIds.push(...uiVariantIds);

                            cy.window().then((win) =>
                              win.scrollTo(0, document.body.scrollHeight)
                            );

                            cy.get("body").then(($body) => {
                              const nextButton = $body.find(
                                'button[aria-label="Go to next page"]:not(:disabled)'
                              );
                              if (nextButton.length > 0) {
                                cy.get('button[aria-label="Go to next page"]')
                                  .scrollIntoView()
                                  .should("be.visible")
                                  .and("not.be.disabled")
                                  .click({ force: true });

                                cy.wait(2000);
                                collectVariantIdsAndPaginate();
                              } else {
                                cy.log(
                                  `Collected ${allVariantIds.length} UI Variant Internal IDs`
                                );
                                cy.wrap(allVariantIds).as("uiVariantIds");
                              }
                            });
                          });
                      }

                      collectVariantIdsAndPaginate();
                    });
                  });
              });
          }
        });
      }
    });

    // STEP 9: Final comparison
    cy.then(function () {
      const backendVariantIds = this.backendVariantIds;
      const uiVariantIds = this.uiVariantIds;

      if (!backendVariantIds || !uiVariantIds) {
        throw new Error("Missing backend or UI variant IDs for comparison");
      }

      cy.log(
        `Comparing ${uiVariantIds.length} UI IDs vs ${backendVariantIds.length} backend IDs`
      );

      const missing = uiVariantIds.filter(
        (id) => !backendVariantIds.includes(id)
      );

      if (missing.length > 0) {
        throw new Error(
          `Mismatch detected: ${
            missing.length
          } UI variant IDs not found in backend.\nMissing examples: ${JSON.stringify(
            missing.slice(0, 10)
          )}`
        );
      }

      cy.log("All UI variantInternalIds successfully matched backend data");
    });
  });
});
