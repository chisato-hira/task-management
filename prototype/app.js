// ---------- データ ----------

let tasks = [
  { id: 1, title: "買い物をする",        description: "牛乳・卵・パン",   priority: "high",   dueDate: "2026-05-10", status: "todo" },
  { id: 2, title: "レポートを提出する",   description: "",               priority: "medium", dueDate: "2026-05-15", status: "todo" },
  { id: 3, title: "プレゼン資料を作る",   description: "第3章まで完成済み", priority: "high",   dueDate: "2026-05-12", status: "in-progress" },
];

let nextId    = 4;
let currentCol = "todo";
let editingId  = null;
let draggedId  = null;
const sortOrders   = { "todo": "default", "in-progress": "default", "done": "default" };
const priorityRank = { high: 0, medium: 1, low: 2 };

function getSortedTasks(colTasks, col) {
  const order = sortOrders[col];
  if (order === "priority") {
    return [...colTasks].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }
  if (order === "dueDate") {
    return [...colTasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }
  return colTasks;
}

// ---------- 初期描画 ----------

function render() {
  const cols = ["todo", "in-progress", "done"];
  cols.forEach(col => {
    const body = document.getElementById(`body-${col}`);
    const btn  = body.querySelector(".add-card-btn");
    const emptyMsg = body.querySelector(".empty-message");

    // カードを全削除して再描画
    Array.from(body.querySelectorAll(".card")).forEach(el => el.remove());

    const colTasks = getSortedTasks(tasks.filter(t => t.status === col), col);
    colTasks.forEach(task => {
      const card = buildCard(task);
      body.insertBefore(card, btn);
    });

    // 空メッセージ
    if (emptyMsg) {
      emptyMsg.style.display = colTasks.length === 0 ? "block" : "none";
    }

    // カウント更新
    document.getElementById(`count-${col}`).textContent = colTasks.length;
  });
}

function buildCard(task) {
  const priorityLabel = { high: "高", medium: "中", low: "低" };
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = task.id;
  card.innerHTML = `
    <div class="card-title">${escapeHtml(task.title)}</div>
    <div class="card-meta">
      <span class="priority ${task.priority}">${priorityLabel[task.priority]}</span>
      ${task.dueDate ? `<span class="due-date">期限: ${formatDate(task.dueDate)}</span>` : ""}
    </div>
  `;
  card.addEventListener("click", () => openEditModal(task.id));

  // ---- カラム内ドラッグ＆ドロップ ----
  card.setAttribute("draggable", "true");

  card.addEventListener("dragstart", () => {
    draggedId = task.id;
    setTimeout(() => card.classList.add("dragging"), 0);
  });

  card.addEventListener("dragend", () => {
    draggedId = null;
    card.classList.remove("dragging");
    clearDropIndicators();
  });

  card.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (!draggedId || draggedId === task.id) return;
    clearDropIndicators();
    const rect = card.getBoundingClientRect();
    if (e.clientY < rect.top + rect.height / 2) {
      card.classList.add("drag-above");
    } else {
      card.classList.add("drag-below");
    }
  });

  card.addEventListener("dragleave", () => {
    card.classList.remove("drag-above", "drag-below");
  });

  card.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearDropIndicators();
    if (draggedId === task.id) return;
    const draggedTask = tasks.find(t => t.id === draggedId);
    if (!draggedTask) return;

    const rect = card.getBoundingClientRect();
    const isAbove = e.clientY < rect.top + rect.height / 2;
    draggedTask.status = task.status;
    const fromIndex = tasks.indexOf(draggedTask);
    tasks.splice(fromIndex, 1);
    const toIndex = tasks.indexOf(task);
    tasks.splice(isAbove ? toIndex : toIndex + 1, 0, draggedTask);
    render();
  });

  return card;
}

function clearDropIndicators() {
  document.querySelectorAll(".drag-above, .drag-below")
    .forEach(el => el.classList.remove("drag-above", "drag-below"));
}

function formatDate(iso) {
  const [, m, d] = iso.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------- カード追加モーダル ----------

document.querySelectorAll(".add-card-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentCol = btn.dataset.col;
    document.getElementById("add-title").value = "";
    document.getElementById("add-desc").value  = "";
    document.getElementById("add-due").value   = "";
    document.querySelector("input[name='add-priority'][value='high']").checked = true;
    hideError("add-title-error");
    openOverlay("overlay-add");
  });
});

document.getElementById("btn-add-cancel").addEventListener("click", () => closeOverlay("overlay-add"));

document.getElementById("btn-add-submit").addEventListener("click", () => {
  const title = document.getElementById("add-title").value.trim();
  if (!title) { showError("add-title-error"); return; }

  const priority = document.querySelector("input[name='add-priority']:checked").value;
  const dueDate  = document.getElementById("add-due").value;
  const desc     = document.getElementById("add-desc").value.trim();

  tasks.push({ id: nextId++, title, description: desc, priority, dueDate, status: currentCol });
  closeOverlay("overlay-add");
  render();
});

// ---------- カード詳細・編集モーダル ----------

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;

  document.getElementById("edit-title").value = task.title;
  document.getElementById("edit-desc").value  = task.description;
  document.getElementById("edit-due").value   = task.dueDate;
  document.querySelector(`input[name='edit-priority'][value='${task.priority}']`).checked = true;
  hideError("edit-title-error");
  openOverlay("overlay-edit");
}

document.getElementById("btn-edit-cancel").addEventListener("click", () => closeOverlay("overlay-edit"));

document.getElementById("btn-edit-save").addEventListener("click", () => {
  const title = document.getElementById("edit-title").value.trim();
  if (!title) { showError("edit-title-error"); return; }

  const task    = tasks.find(t => t.id === editingId);
  task.title    = title;
  task.description = document.getElementById("edit-desc").value.trim();
  task.priority = document.querySelector("input[name='edit-priority']:checked").value;
  task.dueDate  = document.getElementById("edit-due").value;

  closeOverlay("overlay-edit");
  render();
});

document.getElementById("btn-edit-delete").addEventListener("click", () => {
  closeOverlay("overlay-edit");
  openOverlay("overlay-delete");
});

// ---------- 削除確認ダイアログ ----------

document.getElementById("btn-delete-cancel").addEventListener("click", () => {
  closeOverlay("overlay-delete");
  openOverlay("overlay-edit");
});

document.getElementById("btn-delete-confirm").addEventListener("click", () => {
  tasks = tasks.filter(t => t.id !== editingId);
  editingId = null;
  closeOverlay("overlay-delete");
  render();
});

// ---------- オーバーレイ外クリックで閉じる ----------

["overlay-add", "overlay-edit", "overlay-delete"].forEach(id => {
  document.getElementById(id).addEventListener("click", e => {
    if (e.target.id === id) closeOverlay(id);
  });
});

// ---------- ユーティリティ ----------

function openOverlay(id)  { document.getElementById(id).classList.add("active"); }
function closeOverlay(id) { document.getElementById(id).classList.remove("active"); }
function showError(id)    { document.getElementById(id).classList.add("visible"); }
function hideError(id)    { document.getElementById(id).classList.remove("visible"); }

// ---------- カラムへのドロップ（空き領域） ----------

document.querySelectorAll(".column-body").forEach(body => {
  body.addEventListener("dragover", (e) => {
    e.preventDefault();
    body.classList.add("drag-over");
  });

  body.addEventListener("dragleave", (e) => {
    if (!body.contains(e.relatedTarget)) {
      body.classList.remove("drag-over");
    }
  });

  body.addEventListener("drop", (e) => {
    e.preventDefault();
    body.classList.remove("drag-over");
    clearDropIndicators();
    if (!draggedId) return;
    const draggedTask = tasks.find(t => t.id === draggedId);
    if (!draggedTask) return;
    const targetCol = body.id.replace("body-", "");
    draggedTask.status = targetCol;
    render();
  });
});

// ---------- 並び替え ----------

document.querySelectorAll(".col-sort-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const col = btn.dataset.col;
    sortOrders[col] = btn.dataset.sort;
    document.querySelectorAll(`.col-sort-btn[data-col="${col}"]`).forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

// ---------- 完了を一括削除 ----------

document.getElementById("btn-bulk-delete").addEventListener("click", () => {
  const doneCount = tasks.filter(t => t.status === "done").length;
  if (doneCount === 0) return;
  if (window.confirm(`完了済みのタスク ${doneCount} 件をすべて削除しますか？`)) {
    tasks = tasks.filter(t => t.status !== "done");
    render();
  }
});

// ---------- 起動 ----------

render();
