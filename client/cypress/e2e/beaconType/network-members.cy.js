/// <reference types="cypress" />

describe("Network Members Page - core rendering tests", () => {
  const pageUrl = "/network-members";

  let backendBeacons = [];

  before(() => {
    // Load the runtime config served by the app
    cy.request("/config/config.json").then((response) => {
      const apiUrl = `${response.body.apiUrl}/`;

      // Fetch backend beacons directly from the configured API
      cy.request(apiUrl).then((res) => {
        backendBeacons = res.body.responses || [];
        cy.log(`Backend beacons found: ${backendBeacons.length}`);
      });
    });
  });

  beforeEach(() => {
    cy.visit(pageUrl);
  });

  it("renders the same number of beacon cards as returned by backend", () => {
    cy.get("[data-cy=network-beacon-card]", { timeout: 10000 }).should(
      "have.length",
      backendBeacons.length
    );

    // Optionally verify names match (first 5 only, to keep test stable)
    backendBeacons.slice(0, 5).forEach((beacon) => {
      const name = beacon?.response?.name || "Undefined";
      cy.contains(name).should("be.visible");
    });
  });

  it("each beacon card shows the correct available external links", () => {
    cy.get('[data-cy="network-beacon-card"]').each(($card, index) => {
      const response = backendBeacons[index]?.response || {};

      const expectedLinks = [
        {
          label: "Website",
          href: response.organization?.welcomeUrl || response.alternativeUrl,
        },
        {
          label: "Beacon API",
          href: response.alternativeUrl || response.welcomeUrl,
        },
        {
          label: "Contact",
          href: response.organization?.contactUrl || "#",
        },
      ];

      cy.wrap($card).within(() => {
        // The Information link is no longer part of the UI.
        cy.contains("a", "Information").should("not.exist");

        expectedLinks.forEach(({ label, href }) => {
          if (typeof href === "string" && href.trim()) {
            cy.contains("a", label).should("have.attr", "href", href);
          } else {
            cy.contains("a", label).should("not.exist");
          }
        });
      });
    });
  });

  it("renders each configured beacon logo or missing-logo fallback", () => {
    cy.get('[data-cy="network-beacon-card"]').each(($card, index) => {
      const beacon = backendBeacons[index];
      const logoUrl = beacon?.response?.organization?.logoUrl;

      cy.wrap($card).within(() => {
        if (logoUrl) {
          // Verify the correct URL without depending on
          // the external image server being available.
          cy.get("img").should("exist").and("have.attr", "src", logoUrl);
        } else {
          cy.contains("No Logo").should("be.visible");
        }
      });
    });
  });

  it("renders API version, environment, beacon name, organization name, and description", () => {
    cy.get("[data-cy=network-beacon-card]").each(($card, index) => {
      const beacon = backendBeacons[index];
      const res = beacon?.response || {};

      const apiVersion = beacon?.meta?.apiVersion || "Undefined";
      const environment = res.environment || "Undefined";

      const name = res.name || "Undefined";
      const orgName = res.organization?.name || "Undefined";
      const description = (res.description || "").replace(/<[^>]*>/g, "");

      cy.wrap($card).within(() => {
        // Version chip
        cy.contains(apiVersion).should("be.visible");

        // Environment chip
        cy.contains(`Environment: ${environment}`).should("be.visible");

        // Name
        cy.contains(name).should("be.visible");

        // Organization
        cy.contains(orgName).should("be.visible");

        // Description (HTML stripped)
        if (description.trim() !== "") {
          cy.contains(description.slice(0, 20)).should("be.visible");
        }
      });
    });
  });
});
