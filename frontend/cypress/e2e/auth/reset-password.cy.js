describe("Reset Password Page", () => {
    it("should allow user to reset password", () => {
      cy.visit("http://localhost:3000/reset-password?token=valid-token");
  
      cy.get('input[placeholder="Enter new password"]').type("NewPassword123!");
      cy.get('input[placeholder="Confirm new password"]').type("NewPassword123!");
      cy.get("button").contains("Reset Password").click();
  
      // ✅ Expect success message
      cy.contains("Your password has been reset").should("be.visible");
    });
  
    it("should show an error for mismatched passwords", () => {
      cy.visit("http://localhost:3000/reset-password?token=valid-token");
  
      cy.get('input[placeholder="Enter new password"]').type("NewPassword123!");
      cy.get('input[placeholder="Confirm new password"]').type("WrongPassword!");
      cy.get("button").contains("Reset Password").click();
  
      // ✅ Expect error message
      cy.contains("Passwords do not match").should("be.visible");
    });
  });
  