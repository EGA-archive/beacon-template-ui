/// <reference types="cypress" />

describe("Network Members Page — core rendering tests", () => {
  const pageUrl = "/network-members";

  let backendBeacons = [];
  let networkLogo = null;

  before(() => {
    // Fetch backend beacons directly from the API
    cy.readFile("src/config/config.json").then((config) => {
      const apiUrl = `${config.apiUrl}/`;

      cy.request(apiUrl).then((res) => {
        backendBeacons = res.body.responses || [];
        networkLogo = res.body?.response?.organization?.logoUrl || null;

        cy.log(`Backend beacons found: ${backendBeacons.length}`);
        cy.log(`Network logo URL: ${networkLogo}`);
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

  it("each beacon card shows correct external links (information, website, API, contact)", () => {
    cy.get("[data-cy=network-beacon-card]").each(($card, index) => {
      const beacon = backendBeacons[index];
      const response = beacon?.response || {};

      const infoLink = response.welcomeUrl || response.alternativeUrl;
      const websiteLink =
        response.organization?.welcomeUrl || response.alternativeUrl;
      const apiLink = response.alternativeUrl || response.welcomeUrl;
      const contactLink = response.organization?.contactUrl || "#";

      // Buttons visible
      cy.wrap($card).within(() => {
        cy.contains("Information").should("exist");
        cy.contains("Website").should("exist");
        cy.contains("Beacon API").should("exist");
        cy.contains("Contact").should("exist");

        // Check href correctness
        cy.contains("Information").should(
          "have.attr",
          "href",
          infoLink || null
        );
        cy.contains("Website").should("have.attr", "href", websiteLink || null);
        cy.contains("Beacon API").should("have.attr", "href", apiLink || null);
        cy.contains("Contact").should("have.attr", "href", contactLink || null);
      });
    });
  });

  it("renders beacon logos OR fallback, and network logo when available", () => {
    cy.get("[data-cy=network-beacon-card]").each(($card, index) => {
      const beacon = backendBeacons[index];
      const logoUrl = beacon?.response?.organization?.logoUrl;

      cy.wrap($card).within(() => {
        if (logoUrl) {
          cy.get("img")
            .should("have.attr", "src", logoUrl)
            .should("be.visible");
        } else {
          cy.contains("No Logo").should("be.visible");
        }

        if (networkLogo) {
          cy.get("img[src='" + networkLogo + "']").should("be.visible");
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
