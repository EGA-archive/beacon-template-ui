/// <reference types="cypress" />

// Extract entry types exactly like the UI
function extractEntryTypes(mapJson) {
  const endpointSets = mapJson.response?.endpointSets || {};
  const out = new Set();
  Object.values(endpointSets).forEach((item) => {
    const root = item.rootUrl || "";
    const last = root.split("/").pop();
    if (!last) return;
    const normalized = last === "genomicVariations" ? "g_variants" : last;
    out.add(normalized);
  });
  return [...out];
}

// Match UI labels used inside tooltip
function uiLabelFor(segment) {
  if (segment === "g_variants") return "Genomic Variants";
  return segment.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

describe("EntryTypes /map vs UI alignment", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/map").as("mapRequest");
    cy.visit("/");
  });

  it("UI entry types must match backend /map entry types", () => {
    cy.wait("@mapRequest").then((interception) => {
      const mapJson = interception.response.body;
      const backendTypes = extractEntryTypes(mapJson);

      expect(
        backendTypes.length,
        "Backend must expose at least one entry type"
      ).to.be.gt(0);

      // Single-entry-type mode may not render the selector.
      if (backendTypes.length === 1) {
        cy.get('[data-cy="search-button"]', {
          timeout: 15000,
        }).should("exist");

        cy.get("body").then(($body) => {
          const radios = $body.find('[data-testid^="entrytype-radio-"]');

          // If a radio is rendered, its value must match the backend.
          if (radios.length > 0) {
            const uiTypes = [...radios].map((el) =>
              el.getAttribute("data-testid").replace("entrytype-radio-", "")
            );

            expect(uiTypes.sort()).to.deep.equal(backendTypes.sort());
          }
        });

        return;
      }

      // Multiple entry types must render the selector.
      cy.get('[data-testid="entrytype-selector"]', {
        timeout: 15000,
      }).should("be.visible");

      cy.get('[data-testid^="entrytype-radio-"]', { timeout: 15000 })
        .should("have.length", backendTypes.length)
        .then(($radios) => {
          const uiTypes = [...$radios].map((el) =>
            el
              .getAttribute("data-testid")
              .replace("entrytype-radio-", "")
              .trim()
          );

          expect(uiTypes.sort()).to.deep.equal(
            backendTypes.sort(),
            "UI and backend entry types must match"
          );
        });

      // Verify tooltip labels.
      cy.get('[data-testid="entrytypes-tooltip-trigger"]').trigger("mouseover");

      cy.get('[data-testid="entrytypes-tooltip-content"] li').then(($items) => {
        const tooltipTexts = [...$items].map((li) => li.textContent.trim());

        backendTypes.forEach((type) => {
          const expected = uiLabelFor(type);

          expect(
            tooltipTexts.some((text) => text.includes(expected)),
            `Tooltip must contain '${expected}'`
          ).to.be.true;
        });
      });
    });
  });
});
