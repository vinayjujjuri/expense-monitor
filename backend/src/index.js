const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdf = require("pdf-parse");

const {
  parsePhonePeText,
} = require("./phonePePdfParser");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.post("/api/parse-phonepe", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file required" });
    }

    console.log("📄 Parsing:", req.file.originalname);

    const result = await pdf(req.file.buffer);

    const transactions = parsePhonePeText(result.text);

    res.json({
      count: transactions.length,
      expenses: transactions,
    });
  } catch (err) {
    console.error("❌ PDF error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () =>
  console.log("✅ PDF backend running on http://localhost:4000")
);
