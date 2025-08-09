export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const db = require("../../../models");
    if (req.method === "GET") {
      const categories = await db.Category.findAll({
        order: [["name", "ASC"]],
      });
      return res.status(200).json(categories);
    }

    if (req.method === "POST") {
      const { name } = req.body || {};
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "name required" });
      }
      const trimmed = name.trim();

      const existing = await db.Category.findOne({ where: { name: trimmed } });
      if (existing) return res.status(409).json({ error: "category exists" });

      const category = await db.Category.create({ name: trimmed });
      return res.status(201).json(category);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
};
