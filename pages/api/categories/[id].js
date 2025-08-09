export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "id required" });

  try {
    const db = require("../../../models");
    const category = await db.Category.findByPk(id);
    if (!category) return res.status(404).json({ error: "not found" });

    if (req.method === "PUT") {
      const { name } = req.body || {};
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "name required" });
      }
      const trimmed = name.trim();
      const duplicate = await db.Category.findOne({ where: { name: trimmed } });
      if (duplicate && duplicate.id !== category.id) {
        return res.status(409).json({ error: "category exists" });
      }
      category.name = trimmed;
      await category.save();
      return res.status(200).json(category);
    }

    if (req.method === "DELETE") {
      // When category is deleted, set categoryId to null for its tasks
      await db.Task.update(
        { categoryId: null },
        { where: { categoryId: category.id } }
      );
      await category.destroy();
      return res.status(200).json({ message: "deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
}
