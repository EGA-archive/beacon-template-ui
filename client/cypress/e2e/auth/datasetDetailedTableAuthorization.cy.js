describe("Dataset Detailed Table authorization", () => {
  const detailedTableUrl =
    "/dataset-detailed-table" +
    "?beaconId=org.nasertic-archive-beacon-test" +
    "&datasetId=AV_Dataset" +
    "&entryType=g_variants" +
    "&queryId=cypress-authorization-test";

  it("shows access denied when the backend returns 403", () => {
    /**
     * This test focuses only on frontend handling of a forbidden API response.
     *
     * Authentication itself is tested separately, so login is disabled
     * only for this Cypress run to avoid redirecting to the external OIDC provider.
     */
    cy.intercept("GET", "**/config/config.json", (req) => {
      req.continue((res) => {
        res.body.ui.showLogin = false;
      });
    }).as("runtimeConfig");

    /**
     * Pretend the Beacon backend authenticated the request
     * but rejected access to the requested dataset.
     */
    cy.intercept("POST", "**/beacon-network/v2.0.0/g_variants", {
      statusCode: 403,
      body: {
        error: "Forbidden",
        message: "You do not have permission to access this dataset.",
      },
    }).as("forbiddenDatasetRequest");

    cy.visit(detailedTableUrl);

    cy.wait("@forbiddenDatasetRequest");

    cy.contains("You do not have permission to access this dataset.").should(
      "be.visible"
    );

    // Protected records and table controls must not be rendered.
    cy.contains("Select columns").should("not.exist");
    cy.contains("Download Table").should("not.exist");
  });
});
