require("dotenv").config();
const environment = process.env.NODE_ENV || "development";
const commonConfig = {
    charset: "utf8mb4",
    pool: { min: 2, max: 20 },
};
const configs = {
    development: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    },
    production: {
        host: process.env.PROD_DB_HOST,
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASS,
        database: process.env.PROD_DB_NAME,
    },
    test: {
        host: process.env.TEST_DB_HOST,
        user: process.env.TEST_DB_USER,
        password: process.env.TEST_DB_PASS,
        database: process.env.TEST_DB_NAME,
    },
};
const dbConfig = { ...configs[environment], ...commonConfig };

module.exports = {
    dbConfig, environment,
    port: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET,
    saltRounds: parseInt(process.env.SALT_ROUNDS),
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET
};

