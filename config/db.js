const knex = require("knex");
const { dbConfig, environment } = require("./env");
const db = knex({
    client: "mysql2",
    connection: dbConfig,
    pool: dbConfig.pool,
});

// ✅ Ensure database connection is valid
db.raw("SELECT 1")
    .then(() => console.log(`✅ Database connected in ${environment} mode`))
    .catch((err) => {
        console.error("❌ Database connection error:", err);
        setTimeout(() => process.exit(1), 5000);
    });

// ✅ Function to close DB connection (for Jest)
const closeDbConnection = async () => {
    await db.destroy();
    console.log("✅ Database connection closed");
};

module.exports = { db, closeDbConnection };
