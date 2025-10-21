import config from "../../../src/config/config.json";

// This test tests the login access via the login button in the navbar

describe("Login via Navbar (real redirect)", () => {
  if (!config.ui.showLogin) {
    it("skipped because showLogin is disabled in config", () => {
      cy.log("Login feature disabled, skipping login flow test.");
    });
    return;
  }

  it("navigates to LifeScience AAI login page after clicking Log in", () => {
    // 1. Visit homepage
    cy.visit("/");

    // 2. Click 'Log in' in navbar
    cy.get('[data-cy^="nav-link-internal-log-in"]')
      .should("be.visible")
      .click();

    // 3. Confirm /login page loads first
    cy.url().should("include", "/login");
    cy.get('[data-cy="login-page-loader"]').should("be.visible");
    cy.contains("You will be redirected to the login shortly").should(
      "be.visible"
    );

    // 4. Wait for redirect to occur (app leaves localhost)
    cy.wait(2000);

    // 5. Once redirected, check the external page origin safely
    cy.origin("https://login.aai.lifescience-ri.eu", () => {
      cy.location("href").should(
        "include",
        "https://login.aai.lifescience-ri.eu"
      );
    });

    // 6. Optional: wait for you to manually inspect the screen before Cypress closes it
    cy.wait(300);

    cy.origin("https://login.aai.lifescience-ri.eu", () => {
      cy.location("href").should(
        "include",
        "https://login.aai.lifescience-ri.eu"
      );

      // click GitHub option
      cy.get('a[href*="github"]').should("be.visible").click();
    });

    cy.origin("https://github.com", () => {
      // wait for GitHub login form to appear
      cy.get('input[name="login"]').should("be.visible");
      cy.get('input[name="password"]').should("be.visible");

      // fill credentials from environment variables (never hard-code)
      cy.get('input[name="login"]').type(Cypress.env("GITHUB_USERNAME"));
      cy.get('input[name="password"]').type(Cypress.env("GITHUB_PASSWORD"), {
        log: false, // prevents showing the password in Cypress logs
      });

      // click Sign in
      cy.get('input[name="commit"], button[name="commit"]').click();
    });

    cy.origin("https://login.aai.lifescience-ri.eu", () => {
      // Wait for "Continue" button to appear and click it
      cy.get('input[name="continue"]').should("be.visible").click();

      // Wait 10 seconds for the redirection to complete
      cy.wait(10000);
    });

    // 7. Now we are back on localhost and verify Navbar & Footer UI
    // Ensure redirected back to app
    // Confirm we’re indeed back on localhost (any path)
    cy.url().should("match", /^http:\/\/localhost:3000(\/.*)?$/);

    // Wait for the app to rehydrate
    cy.wait(2000);

    // Navbar checks
    cy.get('[data-cy="navbar-title"]').should("contain.text", config.ui.title);
    cy.contains("Hello, Giulia").should("be.visible");
    cy.get('[data-cy="logout-button"]').should("be.visible");

    // Footer checks
    cy.get("footer").within(() => {
      cy.get("svg[data-testid='LogoutIcon']").should("be.visible");
      cy.contains("Log in").should("not.exist");
    });
  });
});
