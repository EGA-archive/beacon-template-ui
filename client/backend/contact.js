import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Breakdown of the purpose:
// This Express server exposes a single POST endpint that
// 1. receives the contact form data,
// 2. validates the input,
// 3. sends the message to the configured contact email,
// 4. using Nodemailer and
// 5. finally reponds with success or error

dotenv.config();
const app = express();
app.use(express.json());

// CORS configuration
// Allows requests only from the origins defined in the .env file
// Multiple origins can be provided separated by commas
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [];

app.use(
  cors({
    origin: allowedOrigins,
  })
);

// This connects to the SMTP provider (for example: Gmail, CRG, AWS SMTP)
// using the credentials in the .env file
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Defines the /api/contact route for sending messages
app.post("/contact", async (req, res) => {
  try {
    // Request validation
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      // It rejects any incomplete submissions
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Creates the email and sends it
    await transporter.sendMail({
      from: `Beacon Contact Form <${process.env.SENDER_EMAIL}>`,
      replyTo: email,
      to: process.env.CONTACT_EMAIL,
      subject: subject || "Beacon Contact Form Submission",
      text: `
Contact Form Submission

Name: ${name}
Email: ${email}

Message:
${message}
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
