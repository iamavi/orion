const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const filterSensitiveData = winston.format((info) => {
    if (info.message.includes("password") || info.message.includes("token")) {
        info.message = "Sensitive Data Redacted";
    }
    return info;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(filterSensitiveData(), winston.format.json()),
    transports: [
        new DailyRotateFile({
            filename: "logs/app-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "14d",
        }),
        new winston.transports.Console({ format: winston.format.simple() }),
    ],
});

module.exports = logger;
