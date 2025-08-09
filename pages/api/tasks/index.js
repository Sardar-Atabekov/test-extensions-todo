export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const db = require("../../../models");
    if (req.method === "GET") {
      const tasks = await db.Task.findAll({
        include: [{ model: db.Category, attributes: ["id", "name"] }],
        order: [["createdAt", "DESC"]],
      });
      return res.status(200).json(tasks);
    }

    if (req.method === "POST") {
      const { title, categoryId } = req.body || {};
      if (!title || typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "title required" });
      }
      let categoryToUse = null;
      if (typeof categoryId !== "undefined" && categoryId !== null) {
        const category = await db.Category.findByPk(categoryId);
        if (!category)
          return res.status(400).json({ error: "invalid categoryId" });
        categoryToUse = category.id;
      }
      const task = await db.Task.create({
        title: title.trim(),
        categoryId: categoryToUse,
      });
      return res.status(201).json(task);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
}
