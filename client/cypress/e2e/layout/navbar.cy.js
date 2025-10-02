import config from "../../../src/config/config.json";

describe("Navbar (config-driven)", () => {
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
});
