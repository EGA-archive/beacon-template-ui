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
    // Track the /map request from the UI
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

      // Wait for UI to render either pills or a Search title
      cy.get("body", { timeout: 15000 }).should(($body) => {
        const pillsExist =
          $body.find('[data-testid="entrytype-buttons"]').length > 0;
        const titlePresent = $body
          .find("h1, h2, h3, h4, h5, h6")
          .toArray()
          .some((el) => el.innerText.includes("Search"));
        expect(
          pillsExist || titlePresent,
          "UI must render entry type pills or single-type title"
        ).to.be.true;
      });

      cy.get("body").then(($body) => {
        const pillsExist =
          $body.find('[data-testid="entrytype-buttons"]').length > 0;

        // Single entry type mode: UI must hide pills
        if (!pillsExist) {
          expect(
            backendTypes.length,
            "UI hides pills only when backend has exactly one entry type"
          ).to.equal(1);
          return;
        }

        // Multi entry type mode: pills must match backend exactly
        cy.get(
          '[data-testid="entrytype-buttons"] [data-testid^="entrytype-"]',
          { timeout: 15000 }
        )
          .should("have.length", backendTypes.length)
          .then(($btns) => {
            const uiTypes = [...$btns].map((el) =>
              el.getAttribute("data-testid").replace("entrytype-", "").trim()
            );
            expect(uiTypes.sort()).to.deep.equal(
              backendTypes.sort(),
              "UI and backend entry types must match"
            );
          });

        // Tooltip validation
        cy.get('[data-testid="entrytypes-tooltip-trigger"]').trigger(
          "mouseover"
        );
        cy.get('[data-testid="entrytypes-tooltip-content"] li').then(
          ($items) => {
            const tooltipTexts = [...$items].map((li) => li.textContent.trim());
            backendTypes.forEach((type) => {
              const expected = uiLabelFor(type);
              const exists = tooltipTexts.some((t) => t.includes(expected));
              expect(exists, `Tooltip must contain '${expected}'`).to.be.true;
            });
          }
        );
      });
    });
  });
});
