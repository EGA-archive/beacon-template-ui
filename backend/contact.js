import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Breakdown of the purpose:
// This Express server exposes a single POST endpint that
// 1. receives the contact form data,
// 2. validates the input,
// 3. map a recipientKey to a real email address,
// 4. then it sends a message using Nodemailer and
// 5. finally reponds with success or error

dotenv.config();
const app = express();
app.use(express.json());

app.use(cors());
const recipientMap = JSON.parse(process.env.RECIPIENT_MAP_JSON || "{}");

// This connects to the SMTP provider (for example: Gmail) using the credentials in the .env file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Defines the /api/contact route for sending messages
app.post("/api/contact", async (req, res) => {
  try {
    // Request validation
    const { name, email, subject, message, recipientKey } = req.body;
    if (!name || !email || !message || !recipientKey) {
      // It rejects any incomplete submissions
      return res.status(400).json({ error: "Missing required fields" });
    }

    // This ensures that the provided key maps to a real email address
    const toEmail = recipientMap[recipientKey];
    if (!toEmail) {
      return res.status(400).json({ error: "Invalid recipient key" });
    }

    // Creates the email and sends it
    await transporter.sendMail({
      from: `${name} <${process.env.SENDER_EMAIL || "no-reply@example.com"}>`,
      to: toEmail,
      subject: subject || "Contact Form Submission",
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
    });

    // If successful
    return res.status(200).json({ success: true, message: "Email sent!" });
  } catch (err) {
    // If NOT successful
    console.error("❌ Error sending email:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
});

// This is the server set up
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Contact backend running on http://localhost:${PORT}`)
);
