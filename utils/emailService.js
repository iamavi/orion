
const AWS = require("aws-sdk");

// Configure AWS SES
const ses = new AWS.SES({
    region: process.env.AWS_REGION, // Example: "us-east-1"
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Function to send email via AWS SES
const sendEmail = async (to, subject, text) => {
    const params = {
        Source: process.env.AWS_SES_FROM_EMAIL, // Your verified email in SES
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: { Data: subject },
            Body: {
                Text: { Data: text },
                Html: { Data: `<p>${text}</p>` }, // HTML version
            },
        },
    };

    try {
        await ses.sendEmail(params).promise();
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error("Email sending failed:", error);
    }
};

module.exports = sendEmail;

// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         type: "OAuth2",
//         user: process.env.EMAIL_USER,
//         clientId: process.env.OAUTH_CLIENT_ID,
//         clientSecret: process.env.OAUTH_CLIENT_SECRET,
//         refreshToken: process.env.OAUTH_REFRESH_TOKEN,
//     },
// });

// const sendEmail = async (to, subject, text) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to,
//         subject,
//         text,
//         html: `<p>${text}</p>`,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent to ${to}`);
//     } catch (error) {
//         console.error("Email Error:", error);
//     }
// };

// module.exports = sendEmail;
