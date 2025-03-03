describe("Login Page", () => {
    it("should log in successfully", () => {
      cy.visit("http://localhost:3000"); // ✅ Update with your login page URL
  
      cy.get('input[placeholder="Enter your email"]').type("test@example.com");
      cy.get('input[placeholder="Enter your password"]').type("password123");
      cy.get("button").contains("Login").click();
  
      // ✅ Check if redirected to dashboard
      cy.url().should("include", "/dashboard");
    });
  
    it("should show an error for invalid credentials", () => {
      cy.visit("http://localhost:3000");
  
      cy.get('input[placeholder="Enter your email"]').type("wrong@example.com");
      cy.get('input[placeholder="Enter your password"]').type("wrongpassword");
      cy.get("button").contains("Login").click();
  
      // ✅ Expect error message to be visible
      cy.contains("Login failed").should("be.visible");
    });
  });
  