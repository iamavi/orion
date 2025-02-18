const request = require("supertest");
const { app, server } = require("../../server");
const { db, closeDbConnection } = require("../../config/db");

// ✅ Close DB connection & server after tests
afterAll(async () => {
    await closeDbConnection();
    server.close();
});

describe("🚀 Server Mode & Database Tests", () => {
    test("✅ API Health Check", async () => {
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
        expect(response.body.message).toContain("Task Management API running in");
    });

    test("✅ Ensure correct environment is loaded", () => {
        expect(process.env.NODE_ENV).toBeDefined();
    });

    test("✅ Check database connection", async () => {
        const result = await db.raw("SELECT 1");
        expect(result).toBeDefined();
    });
});

describe("🛡️ Security & Error Handling Tests", () => {
    test("✅ CSRF Token should be generated in production mode", async () => {
        process.env.NODE_ENV = "production"; // ✅ Simulate Production
        const response = await request(app).get("/api/csrf-token");
        console.log('askjdjaskd',response)
        if (process.env.NODE_ENV === "production") {
            expect(response.status).toBe(200);
            expect(response.body.csrfToken).toBeDefined();
        } else {
            expect(response.status).toBe(404); // Should not be available in other modes
        }
    });

//     test("✅ Should handle errors and return 500 status", async () => {
//         // Mock a route to simulate a server error
//         app.get("/error-test", (req, res, next) => {
//             const error = new Error("Simulated Server Error");
//             error.status = 500;
//             next(error);
//         });

//         const response = await request(app).get("/error-test");

//         expect(response.status).toBe(500);
//         expect(response.body.error).toBe("Simulated Server Error");
//     });

//     test("✅ Should return 404 for non-existing routes", async () => {
//         const response = await request(app).get("/invalid-route");
//         expect(response.status).toBe(404);
//     });
});
