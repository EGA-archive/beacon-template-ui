/// <reference types="cypress" />

describe("Navbar (config-driven + auth)", () => {
  let config;

  // Real key used by oidc-react given your authority and clientId
  const OIDC_STORAGE_KEY =
    "oidc.user:https://login.aai.lifescience-ri.eu/oidc:9db950db-31d8-4966-9f35-e8222d2fdcf6";

  before(() => {
    // Load the runtime config served by the app
    cy.request("/config/config.json").then((response) => {
      config = response.body;
    });
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("renders the title from config", () => {
    cy.get('[data-cy="navbar-title"]')
      .should("be.visible")
      .and("contain.text", config.ui.title);
  });

  it("renders the logo from config", () => {
    cy.get('[data-cy="navbar-logo"]')
      .should("be.visible")
      .and("have.attr", "src", config.ui.logos.main);
  });

  it("renders external navbar links from config", () => {
    const externalLinks = config.ui.externalNavBarLink || [];

    if (externalLinks.length === 0) {
      cy.log("No external navbar links configured.");
      return;
    }

    externalLinks.forEach((item) => {
      const id = item.label.toLowerCase().replace(/\s+/g, "-");

      cy.get(`[data-cy="nav-link-external-${id}"]`)
        .should("be.visible")
        .and("have.attr", "href", item.url)
        .and("have.attr", "target", "_blank");
    });
  });

  it("opens mobile drawer and shows links from config", () => {
    cy.viewport(375, 720);

    cy.get('[data-cy="burger-menu"]').click();

    cy.get('[data-cy="navbar-drawer"]').should("be.visible");

    cy.get('[data-cy="navbar-drawer"]').contains(config.ui.title);

    const externalLinks = config.ui.externalNavBarLink || [];

    externalLinks.forEach((item) => {
      const id = item.label.toLowerCase().replace(/\s+/g, "-");

      cy.get(`[data-cy="nav-link-external-${id}"]`).should("exist");
    });
  });

  context("Authentication behavior", () => {
    it("shows the desktop login link only when enabled in config", () => {
      cy.viewport(1280, 800);
      const loginLink = '[data-cy="nav-link-internal-log-in"]';

      if (config.ui.showLogin) {
        cy.get(loginLink).should("be.visible").and("have.attr", "href", "/login");
      } else {
        cy.get(loginLink).should("not.exist");
      }
    });

    it("does not show a user greeting or logout button without a session", () => {
      cy.viewport(1280, 800);
      cy.get('[data-cy="navbar-links"]').should("be.visible");
      cy.get('[data-cy="navbar-links"]').contains("Hello,").should("not.exist");
      cy.get('[data-cy="logout-button"]').should("not.exist");
    });

    it("shows the correct login state in the mobile drawer", () => {
      cy.viewport(375, 667);
      cy.get('[data-cy="burger-menu"]').click();
      cy.get('[data-cy="navbar-drawer"]').should("be.visible");

      if (config.ui.showLogin) {
        cy.get('[data-cy="navbar-drawer"]')
          .contains("Log in")
          .should("be.visible");
      } else {
        cy.get('[data-cy="navbar-drawer"]')
          .contains("Log in")
          .should("not.exist");
      }

      cy.get('[data-cy="navbar-drawer"]')
        .find('[data-cy="logout-button"]')
        .should("not.exist");
    });

    it("keeps the configured login visibility after reload", () => {
      cy.viewport(1280, 800);
      cy.reload();

      if (config.ui.showLogin) {
        cy.get('[data-cy="nav-link-internal-log-in"]').should("be.visible");
      } else {
        cy.get('[data-cy="nav-link-internal-log-in"]').should("not.exist");
      }
    });
  });
});
