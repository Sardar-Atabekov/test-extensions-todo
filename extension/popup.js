const API_BASE = "http://localhost:3000/api";
// Initialize status state early to avoid TDZ errors
let statusDepth = 0;
let statusTimer = null;
let statusVisible = false;

let tasksCache = [];
let categoriesCache = [];

async function loadTasks(silent = false) {
  if (!silent) showStatus("Loading tasks…");
  const res = await fetch(`${API_BASE}/tasks`);
  const tasks = await res.json();
  if (!silent) hideStatus();
  tasksCache = tasks;
  try {
    localStorage.setItem("todo_tasks", JSON.stringify(tasksCache));
  } catch (e) {}
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("task-list");
  const prevScroll = list.scrollTop;

  const filterSel = document.getElementById("filter-category");
  const filterVal = parseInt(filterSel.value);
  const hideDone = document.getElementById("hide-done").checked;

  const filtered = Number.isNaN(filterVal)
    ? tasksCache
    : tasksCache.filter((t) => t.categoryId === filterVal);
  const visible = hideDone ? filtered.filter((t) => !t.completed) : filtered;

  const fragment = document.createDocumentFragment();
  if (visible.length === 0) {
    const empty = document.createElement("div");
    empty.className = "status";
    empty.textContent = "No tasks";
    fragment.appendChild(empty);
    list.replaceChildren(fragment);
    updateCounts(tasksCache);
    return;
  }

  visible.forEach((task) => {
    const div = document.createElement("div");
    div.className = "task";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", async () => {
      task.completed = checkbox.checked; // optimistic
      renderTasks();
      await updateTask(task.id, { completed: checkbox.checked });
    });
    div.appendChild(checkbox);

    const title = document.createElement("span");
    title.textContent = task.title;
    title.className = `title${task.completed ? " completed" : ""}`;
    div.appendChild(title);

    const select = document.createElement("select");
    (window.categories || []).forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      if (task.categoryId === cat.id) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", async () => {
      task.categoryId = parseInt(select.value); // optimistic
      renderTasks();
      await updateTask(task.id, { categoryId: task.categoryId });
    });
    div.appendChild(select);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      if (!confirm("Delete this task?")) return;
      tasksCache = tasksCache.filter((t) => t.id !== task.id); // optimistic
      renderTasks();
      await deleteTask(task.id);
    });
    div.appendChild(delBtn);

    fragment.appendChild(div);
  });

  list.replaceChildren(fragment);
  list.scrollTop = prevScroll;
  updateCounts(tasksCache);
}

async function loadCategories(silent = false) {
  if (!silent) showStatus("Loading categories…");
  const res = await fetch(`${API_BASE}/categories`);
  const categories = await res.json();
  if (!silent) hideStatus();
  window.categories = categories;
  categoriesCache = categories;
  try {
    localStorage.setItem("todo_categories", JSON.stringify(categoriesCache));
  } catch (e) {}

  const newSel = document.getElementById("new-category");
  const filterSel = document.getElementById("filter-category");
  const prevNew = newSel.value;
  const prevFilter = filterSel.value;
  newSel.innerHTML = "";
  filterSel.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "";
  allOpt.textContent = "All";
  filterSel.appendChild(allOpt);

  window.categories.forEach((cat) => {
    const o1 = document.createElement("option");
    o1.value = cat.id;
    o1.textContent = cat.name;
    newSel.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = cat.id;
    o2.textContent = cat.name;
    filterSel.appendChild(o2);
  });

  if (prevNew) newSel.value = prevNew;
  if (typeof prevFilter !== "undefined") filterSel.value = prevFilter;
}

async function createTask() {
  const title = document.getElementById("new-title").value.trim();
  const categoryId = parseInt(document.getElementById("new-category").value);
  if (!title) return;
  disableInputs(true);
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, categoryId }),
  });
  document.getElementById("new-title").value = "";
  if (res.ok) {
    const created = await res.json();
    tasksCache.unshift(created);
    renderTasks();
  } else {
    showToast("Failed to create task");
  }
  disableInputs(false);
}

async function updateTask(id, data) {
  await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  // background resync to avoid drift
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
  // cache was already updated optimistically
  loadTasks();
}

async function refresh() {
  const refreshBtn = document.getElementById("refresh-btn");
  refreshBtn.classList.add("spinning");
  showStatus("Loading…");
  await Promise.all([loadCategories(true), loadTasks(true)]);
  hideStatus();
  refreshBtn.classList.remove("spinning");
}

document.getElementById("create-task").addEventListener("click", createTask);
document.getElementById("new-title").addEventListener("keydown", (e) => {
  if (e.key === "Enter") createTask();
});
document
  .getElementById("filter-category")
  .addEventListener("change", renderTasks);
document.getElementById("refresh-btn").addEventListener("click", refresh);
document
  .getElementById("add-category")
  .addEventListener("click", createCategory);
document.getElementById("hide-done").addEventListener("change", renderTasks);
document.getElementById("clear-done").addEventListener("click", clearDone);

refresh();

// Hydrate from cache to avoid empty first paint
(function hydrateFromCache() {
  try {
    const cachedCats = localStorage.getItem("todo_categories");
    if (cachedCats) {
      categoriesCache = JSON.parse(cachedCats);
      window.categories = categoriesCache;
      // populate selects with cached categories
      const newSel = document.getElementById("new-category");
      const filterSel = document.getElementById("filter-category");
      if (newSel && filterSel) {
        const prevNew = newSel.value;
        const prevFilter = filterSel.value;
        newSel.innerHTML = "";
        filterSel.innerHTML = "";
        const allOpt = document.createElement("option");
        allOpt.value = "";
        allOpt.textContent = "All";
        filterSel.appendChild(allOpt);
        categoriesCache.forEach((cat) => {
          const o1 = document.createElement("option");
          o1.value = cat.id;
          o1.textContent = cat.name;
          newSel.appendChild(o1);
          const o2 = document.createElement("option");
          o2.value = cat.id;
          o2.textContent = cat.name;
          filterSel.appendChild(o2);
        });
        if (prevNew) newSel.value = prevNew;
        if (typeof prevFilter !== "undefined") filterSel.value = prevFilter;
      }
    }
    const cachedTasks = localStorage.getItem("todo_tasks");
    if (cachedTasks) {
      tasksCache = JSON.parse(cachedTasks);
      renderTasks();
    }
  } catch (e) {
    // ignore cache errors
  }
})();

function showStatus(text) {
  statusDepth += 1;
  if (statusVisible) {
    const el = document.getElementById("status");
    el.textContent = text;
    return;
  }
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    const el = document.getElementById("status");
    el.textContent = text;
    el.hidden = false;
    statusVisible = true;
  }, 250);
}

function hideStatus() {
  statusDepth = Math.max(0, statusDepth - 1);
  if (statusDepth === 0) {
    clearTimeout(statusTimer);
    statusTimer = null;
    if (statusVisible) {
      const el = document.getElementById("status");
      el.hidden = true;
      el.textContent = "";
      statusVisible = false;
    }
  }
}

function updateCounts(allTasks) {
  const total = allTasks.length;
  const done = allTasks.filter((t) => t.completed).length;
  const el = document.getElementById("counts");
  el.textContent = `${done}/${total}`;
}

function disableInputs(disabled) {
  [
    "create-task",
    "new-title",
    "new-category",
    "add-category",
    "new-cat-name",
    "filter-category",
    "refresh-btn",
    "hide-done",
    "clear-done",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  });
}

async function createCategory() {
  const name = document.getElementById("new-cat-name").value.trim();
  if (!name) return;
  disableInputs(true);
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (res.ok) {
    document.getElementById("new-cat-name").value = "";
    await refresh();
  } else {
    const body = await res.json().catch(() => ({}));
    alert(body.error || "Failed to create category");
  }
  disableInputs(false);
}

async function clearDone() {
  if (!confirm("Delete all completed tasks?")) return;
  // optimistic remove
  const completed = tasksCache.filter((t) => t.completed);
  tasksCache = tasksCache.filter((t) => !t.completed);
  renderTasks();
  for (const t of completed) {
    // best-effort, sequential to avoid flooding
    // eslint-disable-next-line no-await-in-loop
    await fetch(`${API_BASE}/tasks/${t.id}`, { method: "DELETE" });
  }
  loadTasks();
  showToast("Completed tasks cleared");
}

function showToast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.hidden = false;
  setTimeout(() => {
    el.hidden = true;
    el.textContent = "";
  }, 2000);
}
