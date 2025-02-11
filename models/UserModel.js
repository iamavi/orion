const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const createUser = async (firstName, lastName, email, password, role) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return db("employees").insert({
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: hashedPassword,
        role,
    });
};

// Get employee details by email
const getEmployeeByEmail = async (email) => {
    return db("employees").where({ email }).first();
};

// Get authentication details by employee_id
const getAuthDetailsByEmployeeId = async (employee_id) => {
    return db("employee_auth").where({ employee_id }).first();
};


const findUserByEmail = async (email) => {
    return db("employees").where({ email }).first();
};

const updatePassword = async (email, newPassword) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    return db("employees").where({ email }).update({ password_hash: hashedPassword });
};

const setPasswordResetToken = async (email) => {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

    await db("employees").where({ email }).update({ reset_token: token, reset_token_expires: expiresAt });

    return token;
};

const getUserByResetToken = async (token) => {
    return db("employees").where({ reset_token: token }).andWhere("reset_token_expires", ">", new Date()).first();
};

const clearResetToken = async (email) => {
    return db("employees").where({ email }).update({ reset_token: null, reset_token_expires: null });
};


// Store refresh token in the database
const storeRefreshToken = async (employee_id, refreshToken) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Refresh token expires in 7 days

    return db("sessions")
        .insert({ employee_id, token_hash: refreshToken, is_active: 1, expires_at: expiresAt })
        .onConflict("employee_id")
        .merge(); // Updates token if user logs in again
};

module.exports = {
    createUser,
    findUserByEmail,
    updatePassword,
    setPasswordResetToken,
    getUserByResetToken,
    clearResetToken,
    getEmployeeByEmail,
    getAuthDetailsByEmployeeId,
    storeRefreshToken,

};

