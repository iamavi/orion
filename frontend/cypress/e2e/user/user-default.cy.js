describe("User Default Page", () => {
    it("should redirect logged-in user to the correct page", () => {
      cy.visit("http://localhost:3000");
  
      // Simulate user login by storing token
      cy.setCookie("auth_token", "fake-token");
      cy.reload();
  
      // ✅ Check if redirected correctly
      cy.url().should("include", "/dashboard");
    });
  
    it("should not allow access to user dashboard if not logged in", () => {
      cy.visit("http://localhost:3000/dashboard");
  
      // ✅ Expect redirect to login
      cy.url().should("include", "/");
    });
  });
  