/// <reference types="cypress" />

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 700 },
  { name: "tablet", width: 768, height: 1000 },
  { name: "desktop", width: 1280, height: 900 },
];

describe("Footer Component", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("renders the footer container", () => {
    cy.get('[data-testid="footer"]').should("exist").and("be.visible");
  });

  it("shows the credit text", () => {
    cy.get('[data-testid="footer-credit-text"]')
      .should("exist")
      .and("contain.text", "Beacon User Interface template provided by");
  });

  it("renders all institutional logos", () => {
    cy.get('[data-testid="footer-logo-ega"] img').should("have.attr", "src");
    cy.get('[data-testid="footer-logo-crg"] img').should("have.attr", "src");
    cy.get('[data-testid="footer-logo-bsc"] img').should("have.attr", "src");
  });

  it("checks that each logo link opens in a new tab and is safe", () => {
    ["footer-logo-ega", "footer-logo-crg", "footer-logo-bsc"].forEach((id) => {
      cy.get(`[data-testid="${id}"]`)
        .should("have.attr", "target", "_blank")
        .and("have.attr", "rel")
        .and((rel) => {
          expect(rel).to.include("noopener");
          expect(rel).to.include("noreferrer");
        });
    });
  });

  it("shows login button when showLogin=true, otherwise footer-right is hidden", () => {
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="footer-right"]').length > 0) {
        cy.get('[data-testid="footer-login-button"]').should("exist");
      } else {
        cy.get('[data-testid="footer-login-button"]').should("not.exist");
      }
    });
  });

  VIEWPORTS.forEach(({ name, width, height }) => {
    it(`renders correctly on ${name} viewport`, () => {
      cy.viewport(width, height);
      cy.get('[data-testid="footer"]').should("be.visible");

      cy.get('[data-testid="footer-logo-ega"]').should("be.visible");
      cy.get('[data-testid="footer-logo-crg"]').should("be.visible");
      cy.get('[data-testid="footer-logo-bsc"]').should("be.visible");

      cy.window().then((win) => {
        const docWidth = win.document.documentElement.scrollWidth;
        const viewportWidth = win.innerWidth;
        expect(docWidth).to.be.lte(viewportWidth + 2);
      });
    });
  });

  it("footer appears after main content (correct layout ordering)", () => {
    cy.get('[data-testid="footer"]')
      .parent()
      .children()
      .last()
      .should("have.attr", "data-testid", "footer");
  });
});
