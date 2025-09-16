describe("Navbar", () => {
  const internalLabel = "About";
  const externalLabel = "EGA";

  const navItems = [
    { label: internalLabel, url: "/about" },
    { label: externalLabel, url: "https://ega-archive.org" },
  ];

  beforeEach(() => {
    cy.visit("/"); // assicurati che la navbar venga montata qui
  });

  it("renders the title", () => {
    cy.contains("EGA Allele Frequency Browser").should("be.visible");
  });

  it("renders the logo image", () => {
    cy.get("img.logo-small").should("be.visible");
  });

  it("renders internal and external nav links (desktop)", () => {
    cy.viewport(1280, 720); // for desktop view
    cy.get(".nav-items-box").should("be.visible");
    cy.contains(internalLabel).should("exist");
    cy.contains(externalLabel).should("exist");
  });

  it("opens the mobile drawer and shows nav links", () => {
    cy.viewport(375, 720); // simulate mobile
    cy.get(
      'button[aria-label="Open navigation menu"], .MuiIconButton-root'
    ).click();
    cy.contains(internalLabel).should("be.visible");
    cy.contains(externalLabel).should("be.visible");
  });

  it("external link opens in new tab", () => {
    cy.contains(externalLabel)
      .should("have.attr", "href", "https://ega-archive.org")
      .and("have.attr", "target", "_blank");
  });
});
