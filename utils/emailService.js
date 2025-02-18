const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
// ✅ Create SES Client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Function to send an email via AWS SES
const sendEmail = async (to, subject, text) => {
  const params = {
    Source: process.env.AWS_SES_FROM_EMAIL, // Your verified email in SES
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: {
        Text: { Data: text },
        Html: { Data: `<p>${text}</p>` }, // HTML version
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

module.exports = sendEmail;
