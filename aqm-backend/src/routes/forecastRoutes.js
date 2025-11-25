const express = require("express");
const router = express.Router();
const { predictPM25 } = require("../services/mlPredictor");

router.post("/", async (req, res) => {
  console.log("Received POST to /api/forecast with body:", req.body);

  try {
    const { date, district } = req.body;

    if (!date || !district) {
      return res.status(400).json({ error: "Missing date or district" });
    }

    // Get prediction from our ML service
    const pm25 = predictPM25(date, district);

    res.json({ pm25 });
  } catch (error) {
    console.error("Error in forecast prediction:", error.message);
    res.status(500).json({ error: "Error generating forecast" });
  }
});

router.options("/", (req, res) => {
  res.sendStatus(204);
});

module.exports = router;
