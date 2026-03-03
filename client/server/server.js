const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const feedbackFile = path.join(process.cwd(), "data", "feedback.txt");

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

const buildPath = path.join(process.cwd(), "build");

app.use(express.static(buildPath));

app.get("*", (_, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
});
