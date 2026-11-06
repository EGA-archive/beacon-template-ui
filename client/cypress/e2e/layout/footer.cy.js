/// <reference types="cypress" />

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 700 },
  { name: "tablet", width: 768, height: 1000 },
  { name: "desktop", width: 1280, height: 900 },
];

const INSTITUTIONS = [
  { name: "EGA", href: "https://ega-archive.org/" },
  { name: "CRG", href: "https://www.crg.eu/" },
  { name: "BSC", href: "https://www.bsc.es/" },
];

describe("Footer Component", () => {
  let config;

  before(() => {
    cy.request("/config/config.json").then(({ body }) => {
      config = body;
    });
  });

  beforeEach(() => {
    cy.visit("/");
  });

  it("renders the footer container", () => {
    cy.get('[data-testid="footer"]').should("be.visible");
  });

  it("shows the appropriate institutional credit text", () => {
    const hasLegalLinks = (config.ui?.cookies?.links || []).length > 0;
    const expectedText = hasLegalLinks
      ? "Beacon Template User Interface provided by:"
      : "Beacon User Interface template provided by:";

    cy.get('[data-testid="footer"]').contains(expectedText).should("be.visible");
  });

  it("renders EGA, CRG and BSC logos with accessible names", () => {
    INSTITUTIONS.forEach(({ name, href }) => {
      cy.get('[data-testid="footer"]')
        .find(`a[href="${href}"] img[alt="${name} Logo"]`)
        .should("be.visible")
        .and("have.attr", "src")
        .and("not.be.empty");
    });
  });

  it("opens institutional links safely in a new tab", () => {
    INSTITUTIONS.forEach(({ href }) => {
      cy.get('[data-testid="footer"]')
        .find(`a[href="${href}"]`)
        .should("have.attr", "target", "_blank")
        .and("have.attr", "rel")
        .and((rel) => {
          expect(rel.split(/\s+/)).to.include("noopener");
          expect(rel.split(/\s+/)).to.include("noreferrer");
        });
    });
  });

  it("shows the footer login action only when login is enabled", () => {
    cy.get('[data-testid="footer-right"]').should("exist");
    if (config.ui.showLogin) {
      cy.get('[data-testid="footer-right"]')
        .contains("a", /^Log in$/)
        .should("be.visible");
    } else {
      cy.get('[data-testid="footer-right"]')
        .contains("a", /^Log in$/)
        .should("not.exist");
    }
  });

  VIEWPORTS.forEach(({ name, width, height }) => {
    it(`renders logos without horizontal page overflow on ${name}`, () => {
      cy.viewport(width, height);
      cy.get('[data-testid="footer"]').scrollIntoView().should("be.visible");

      INSTITUTIONS.forEach(({ name, href }) => {
        cy.get('[data-testid="footer"]')
          .find(`a[href="${href}"] img[alt="${name} Logo"]`)
          .should("be.visible");
      });

      cy.window().then((win) => {
        expect(
          win.document.documentElement.scrollWidth,
          "No horizontal overflow"
        ).to.be.lte(win.innerWidth + 2);
      });
    });
  });

  it("appears after the main page content", () => {
    cy.get('[data-testid="footer"]')
      .parent()
      .children()
      .last()
      .should("have.attr", "data-testid", "footer");
  });
});
