const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const District = require("../models/District");

router.post("/", async (req, res) => {
  console.log("Получено тело жалобы:", req.body);
  
  try {
    const { title, category, district, description, name, email, DistrictId } = req.body;

    // build structured validation errors
    const errors = {};

    if (!title || !String(title).trim()) errors.title = 'Title is required';
    if (!category || !String(category).trim()) errors.category = 'Category is required';
    if (!description || !String(description).trim()) errors.description = 'Description is required';
    if (!name || !String(name).trim()) errors.name = 'Name is required';
    if (!email || !String(email).trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(String(email))) {
      errors.email = 'Invalid email format';
    }

    // district presence is validated after we try to resolve it

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation error', errors });
    }

    let districtInstance = null;

    if (DistrictId) {
      districtInstance = await District.findByPk(DistrictId);
    } else if (typeof district === 'number' || /^[0-9]+$/.test(String(district))) {
      districtInstance = await District.findByPk(parseInt(district, 10));
    } else if (typeof district === 'string') {
      districtInstance = await District.findOne({ where: { name: district } });
    }

    if (!districtInstance) {
      // attach district-specific error
      return res.status(400).json({ message: 'Validation error', errors: { district: 'Указанный район не найден' } });
    }

    const complaint = await Complaint.create({
      title,
      category,
      description,
      name,
      email,
      DistrictId: districtInstance.id
    });

    res.status(201).json({ message: "Жалоба успешно сохранена", complaint });
  } catch (error) {
    console.error("Ошибка при сохранении жалобы:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
});

router.get("/", async (req, res) => {
    try {
      const complaints = await Complaint.findAll({
        include: {
          model: require("../models/District"),
          attributes: ["name"]
        },
        order: [["createdAt", "DESC"]]
      });
  
      res.json(complaints);
    } catch (error) {
      console.error("Ошибка при получении жалоб:", error);
      res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  });

// Export complaints as JSON or CSV
router.get("/export", async (req, res) => {
  try {
    const format = (req.query.format || 'json').toLowerCase();
    const complaints = await Complaint.findAll({
      include: { model: require("../models/District"), attributes: ["name"] },
      order: [["createdAt", "DESC"]]
    });

    const rows = complaints.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      description: c.description,
      name: c.name,
      email: c.email,
      DistrictId: c.DistrictId,
      districtName: c.District ? c.District.name : null,
      createdAt: c.createdAt
    }));

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="complaints.csv"');

      const escape = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v).replace(/"/g, '""').replace(/\r?\n/g, ' ');
        return '"' + s + '"';
      };

      const header = ['id','title','category','description','name','email','DistrictId','districtName','createdAt'];
      const lines = [header.join(',')];
      for (const r of rows) {
        lines.push([r.id, r.title, r.category, r.description, r.name, r.email, r.DistrictId, r.districtName, r.createdAt].map(escape).join(','));
      }
      res.send(lines.join('\n'));
      return;
    }

    // default: JSON
    res.json(rows);
  } catch (error) {
    console.error('Error exporting complaints:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  

module.exports = router;

