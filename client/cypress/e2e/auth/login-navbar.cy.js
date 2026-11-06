/// <reference types="cypress" />

// These checks are deterministic for both public and login-enabled deployments.
// Real OIDC sign-in, callback, and logout still need an integration test on an
// auth-enabled environment. Do not fake authentication by writing an OIDC key
// directly to localStorage: the OIDC provider validates that state.

describe("Login via Navbar (runtime configuration)", () => {
  let config;

  before(() => {
    cy.request("/config/config.json").then(({ body }) => {
      config = body;
    });
  });

  it("matches the configured login availability", () => {
    cy.visit("/");

    if (config.ui.showLogin) {
      cy.get('[data-cy="nav-link-internal-log-in"]')
        .should("be.visible")
        .and("have.attr", "href", "/login");
      cy.get('[data-testid="footer-right"]')
        .contains("a", /^Log in$/)
        .should("be.visible");
    } else {
      cy.get('[data-cy="nav-link-internal-log-in"]').should("not.exist");
      cy.get('[data-testid="footer-right"]')
        .contains("a", /^Log in$/)
        .should("not.exist");
    }
  });

  it("does not initiate sign-in for public Beacons", function () {
    if (config.ui.showLogin) {
      this.skip(); // Requires a separate OIDC-enabled integration run.
    }

    cy.visit("/login");
    cy.contains("You will be redirected to the login shortly").should(
      "not.exist"
    );
  });

  it("exposes a configured OIDC login entry when authentication is enabled", function () {
    if (!config.ui.showLogin) {
      this.skip(); // Public Beacon; no OIDC login is expected.
    }

    cy.visit("/");
    cy.get('[data-cy="nav-link-internal-log-in"]')
      .should("be.visible")
      .and("have.attr", "href", "/login");
  });
});
