describe("stPENDLE dashboard", () => {
  it("renders vault overview and metrics", () => {
    cy.visit("/")

    cy.contains("Wallet Overview", { timeout: 20000 }).should("be.visible")
    cy.contains("Vault Metrics").should("be.visible")
    cy.contains("Redemption Queue").should("be.visible")
    cy.contains("Admin Controls").should("be.visible")
  })
})
