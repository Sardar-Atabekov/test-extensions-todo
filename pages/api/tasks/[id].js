export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "id required" });

  try {
    const db = require("../../../models");
    const task = await db.Task.findByPk(id);
    if (!task) return res.status(404).json({ error: "not found" });

    if (req.method === "PUT") {
      const { completed, title, categoryId } = req.body || {};
      if (typeof completed !== "undefined") task.completed = !!completed;
      if (typeof title !== "undefined") {
        if (typeof title !== "string" || !title.trim()) {
          return res.status(400).json({ error: "invalid title" });
        }
        task.title = title.trim();
      }
      if (typeof categoryId !== "undefined") {
        if (categoryId === null) {
          task.categoryId = null;
        } else {
          const category = await db.Category.findByPk(categoryId);
          if (!category)
            return res.status(400).json({ error: "invalid categoryId" });
          task.categoryId = category.id;
        }
      }
      await task.save();
      return res.status(200).json(task);
    }

    if (req.method === "DELETE") {
      await task.destroy();
      return res.status(200).json({ message: "deleted" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
};
