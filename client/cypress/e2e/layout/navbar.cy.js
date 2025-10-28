import config from "../../../src/config/config.json";

describe("Navbar (config-driven + auth)", () => {
  // Real key used by oidc-react given your authority and clientId
  const OIDC_STORAGE_KEY =
    "oidc.user:https://login.aai.lifescience-ri.eu/oidc:9db950db-31d8-4966-9f35-e8222d2fdcf6";

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

  if (config.ui.externalNavBarLink?.length > 0) {
    it("renders external navbar links from config", () => {
      config.ui.externalNavBarLink.forEach((item) => {
        const id = item.label.toLowerCase().replace(/\s+/g, "-");
        cy.get(`[data-cy="nav-link-external-${id}"]`)
          .should("be.visible")
          .and("have.attr", "href", item.url)
          .and("have.attr", "target", "_blank");
      });
    });
  }

  it("opens mobile drawer and shows links from config", () => {
    cy.viewport(375, 720);
    cy.get('[data-cy="burger-menu"]').click();
    cy.get('[data-cy="navbar-drawer"]').should("be.visible");
    cy.get('[data-cy="navbar-drawer"]').contains(config.ui.title);

    config.ui.externalNavBarLink.forEach((item) => {
      const id = item.label.toLowerCase().replace(/\s+/g, "-");
      cy.get(`[data-cy="nav-link-external-${id}"]`).should("exist");
    });
  });

  context("Authentication behavior", () => {
    const fakeLogin = {
      profile: { given_name: "Giulia" },
      access_token: "fake_access_token",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };

    it("shows login when user is not logged in", () => {
      cy.viewport(1280, 800);
      cy.get('[data-cy="navbar-links"]')
        .contains("Log in")
        .should("be.visible");
    });

    it("shows username and logout icon when logged in (desktop)", () => {
      // ✅ Set localStorage before visit
      cy.then(() => {
        window.localStorage.setItem(
          OIDC_STORAGE_KEY,
          JSON.stringify(fakeLogin)
        );
      });

      cy.visit("/");
      cy.viewport(1280, 800);
      cy.wait(1000); // ⏳ wait for OIDC-react to rehydrate

      cy.contains("Hello, Giulia").should("be.visible");
      cy.get('[data-cy="logout-button"]').should("exist");
    });

    it("shows logout inside mobile drawer when logged in", () => {
      cy.then(() => {
        window.localStorage.setItem(
          OIDC_STORAGE_KEY,
          JSON.stringify(fakeLogin)
        );
      });

      cy.visit("/");
      cy.viewport(375, 667);
      cy.wait(1000); // ⏳ ensure context ready

      cy.get('[data-cy="burger-menu"]').click();
      cy.get('[data-cy="navbar-drawer"]').should("be.visible");
      cy.get('[data-cy="logout-button"]').should("exist");
    });

    it("removes OIDC data from localStorage on logout click", () => {
      cy.then(() => {
        window.localStorage.setItem(
          OIDC_STORAGE_KEY,
          JSON.stringify(fakeLogin)
        );
      });

      cy.visit("/");
      cy.wait(1000); // ⏳ wait before checking logout

      cy.get('[data-cy="logout-button"]').click();

      cy.window().then((win) => {
        expect(win.localStorage.getItem(OIDC_STORAGE_KEY)).to.be.null;
      });
    });
  });
});
