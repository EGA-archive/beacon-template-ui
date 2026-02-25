import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const feedbackFile =
  process.env.FEEDBACK_FILE_PATH || path.join(process.cwd(), "feedback.txt");

app.post("/api/feedback", (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || typeof rating !== "number") {
    return res.status(400).json({ error: "Invalid rating" });
  }

  const entry = `
Date: ${new Date().toISOString()}
Rating: ${rating}
Comment: ${comment || ""}
`;

  fs.appendFile(feedbackFile, entry, (err) => {
    if (err) {
      console.error("Error writing feedback:", err);
      return res.status(500).json({ error: "Could not save feedback" });
    }

    res.status(200).json({ success: true });
  });
});

app.listen(4010, () => {
  console.log("Feedback API running on port 4010");
});
