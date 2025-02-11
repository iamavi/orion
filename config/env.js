require("dotenv").config();

module.exports = {
    port: process.env.PORT || 5000,
    dbConfig: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    },
    jwtSecret: process.env.JWT_SECRET,
    saltRounds: parseInt(process.env.SALT_ROUNDS),
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET
};

