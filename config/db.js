const knex = require("knex");
const { dbConfig } = require("./env");

const db = knex({
    client: "mysql2",
    connection: dbConfig,
    pool: { min: 2, max: 20 }, // Increased max connections for scalability
});

// Handle database connection errors and retry logic
db.raw("SELECT 1")
    .then(() => console.log("Database connected successfully"))
    .catch((err) => {
        console.error("Database connection error:", err);
        setTimeout(() => process.exit(1), 5000); // Restart process after 5 seconds
    });

module.exports = db;
