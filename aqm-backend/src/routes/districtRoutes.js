const express = require("express");
const router = express.Router();
const District = require("../models/District");

router.get("/", async (req, res) => {
  try {
    const districts = await District.findAll();
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении районов" });
  }
});

module.exports = router;
