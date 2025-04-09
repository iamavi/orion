const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/emailService");
const {db} = require("../config/db"); // Database connection
const crypto = require("crypto");

// ✅ Create New User (Admin Only)
const createUser = async (req, res) => {
    const { first_name, last_name, email, role, phone, department } = req.body;
    const generatePassword = (length = 12) => {
        return crypto.randomBytes(length).toString("base64").slice(0, length);
    };
    const password = generatePassword(11);
    // Basic input validation
    if (!first_name || !last_name || !email || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if the email already exists
        const existingEmployee = await db("employees").where({ email }).first();
        if (existingEmployee) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hash the password before storing it
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync( password, salt);

        // Insert employee into the employees table
        const [employeeId] = await db("employees").insert({
            first_name,
            last_name,
            email,
            phone,
            department,
            role,
        });

        // Insert the password hash and salt into employee_auth table
        await db("employee_auth").insert({
            employee_id: employeeId,
            password_hash: hashedPassword,
            salt: salt,
            auth_provider: 'local',
        });

        // Send email with login credentials via AWS SES
        const subject = "Welcome! Your Login Credentials";
        const text = `
        Hello <strong>${first_name} ${last_name}</strong>,<br><br>
        
        You have been successfully registered.<br><br>
        
        <strong>Login Credentials:</strong><br>
        🔹 <strong>Email:</strong> ${email} <br>
        🔹 <strong>Password:</strong> ${password} (Please change it after first login) <br><br>
        
        Best regards,<br>
        <strong>Xumane</strong>
        `;

        await sendEmail(email, subject, text);

        return res.status(201).json({ message: "User registered successfully, and credentials sent via email" });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// ✅ Fetch All Users (Admin Only)
const getAllUsers = async (req, res) => {
    try {
        const users = await db("employees")
            .select(
                "employees.id",
                "employees.first_name",
                "employees.last_name",
                "employees.email",
                "employees.role",
                "employees.reporting_manager",
                "employees.department",
                "employees.status",
                "employees.created_at",
                "departments.name as department_name",
                db.raw("CONCAT(manager.first_name, ' ', manager.last_name) as manager_name")
            )
            .leftJoin("departments", "employees.department", "departments.id")
            .leftJoin("employees as manager", "employees.reporting_manager", "manager.id");

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { createUser, getAllUsers };
