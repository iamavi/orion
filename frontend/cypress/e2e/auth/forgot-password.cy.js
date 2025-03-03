describe("Forgot Password Page", () => {
    it("should send a password reset link", () => {
      cy.visit("http://localhost:3000/forgot-password");
  
      cy.get('input[placeholder="Enter your email"]').type("test@example.com");
      cy.get("button").contains("Send Reset Link").click();
  
      // ✅ Expect success message
      cy.contains("Reset link sent successfully").should("be.visible");
    });
  
    it("should show an error for invalid email", () => {
      cy.visit("http://localhost:3000/forgot-password");
  
      cy.get('input[placeholder="Enter your email"]').type("invalidemail");
      cy.get("button").contains("Send Reset Link").click();
  
      // ✅ Expect error message
      cy.contains("Invalid email address").should("be.visible");
    });
  });
  