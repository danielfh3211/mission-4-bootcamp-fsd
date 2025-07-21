// ===== Variabel Global =====
let todos = [];
let todoIdCounter = 1;

// ===== Ambil Elemen DOM =====
const todoText = document.getElementById("todoText");
const submitBtn = document.getElementById("submitBtn");
const todoList = document.getElementById("todoList");
const overdueList = document.getElementById("overdueList");
const doneList = document.getElementById("doneList");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const todoCount = document.getElementById("todoCount");
const overdueCount = document.getElementById("overdueCount");
const doneCount = document.getElementById("doneCount");
const currentTime = document.getElementById("currentTime");

// ===== Inisialisasi Aplikasi =====
function init() {
  updateTimeDisplay();
  setInterval(updateTimeDisplay, 1000);
  loadFromLocalStorage();
  renderTodos();

  // --- Refresh otomatis agar overdue selalu update ---
  setInterval(renderTodos, 10000);

  submitBtn.addEventListener("click", addTodo);
  deleteAllBtn.addEventListener("click", deleteAllTodos);

  todoText.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addTodo();
    }
  });
}

// ===== Update Waktu di Header =====
function updateTimeDisplay() {
  const now = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dayName = days[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  currentTime.textContent = `${dayName}, ${day} ${month} ${year}`;
}

// ===== Tambahkan Todo Baru =====
function addTodo() {
  const text = todoText.value.trim();
  const priority = document.getElementById("priority").value;

  if (!text) {
    alert("Silakan masukkan tugas terlebih dahulu!");
    return;
  }
  if (!priority) {
    alert("Silakan pilih level prioritas!");
    return;
  }

  const todo = {
    id: todoIdCounter++,
    text: text,
    priority: priority,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  todos.push(todo);
  todoText.value = "";
  document.getElementById("priority").value = "";

  saveToLocalStorage();
  renderTodos();
}

// ===== Toggle Todo Selesai / Belum =====
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date().toISOString() : null;
    saveToLocalStorage();
    renderTodos();
  }
}

// ===== Hapus Semua Todo =====
function deleteAllTodos() {
  if (todos.length === 0) {
    alert("Tidak ada tugas untuk dihapus!");
    return;
  }
  if (confirm("Apakah Anda yakin ingin menghapus semua tugas?")) {
    todos = [];
    saveToLocalStorage();
    renderTodos();
  }
}

// ===== Cek apakah Todo sudah Overdue =====
function isOverdue(todo) {
  if (todo.completed) return false;

  const created = new Date(todo.createdAt);
  const now = new Date();
  const diffMinutes = (now - created) / (1000 * 60);

  const overdueMinutes = {
    high: 2,
    medium: 5,
    low: 10,
  };

  return diffMinutes > overdueMinutes[todo.priority];
}

// ===== Tampilkan Todo di Halaman =====
function renderTodos() {
  const activeTodos = todos.filter((todo) => !todo.completed);
  const overdueTodos = activeTodos.filter(isOverdue);
  const regularTodos = activeTodos.filter((todo) => !isOverdue(todo));
  const completedTodos = todos.filter((todo) => todo.completed);

  todoCount.textContent = regularTodos.length;
  overdueCount.textContent = overdueTodos.length;
  doneCount.textContent = completedTodos.length;

  // Tugas aktif
  todoList.innerHTML =
    regularTodos.length === 0
      ? '<div class="empty-state">Semua tugas dalam kondisi baik!</div>'
      : regularTodos
          .sort((a, b) => {
            const order = { high: 3, medium: 2, low: 1 };
            if (order[a.priority] !== order[b.priority]) {
              return order[b.priority] - order[a.priority];
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
          })
          .map(createTodoHTML)
          .join("");

  // Tugas terlambat
  overdueList.innerHTML =
    overdueTodos.length === 0
      ? '<div class="empty-state">Tidak ada tugas yang terlambat. Bagus!</div>'
      : overdueTodos
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(createTodoHTML)
          .join("");

  // Tugas selesai
  doneList.innerHTML =
    completedTodos.length === 0
      ? '<div class="empty-state">Belum ada tugas yang selesai.</div>'
      : completedTodos
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
          .map(createTodoHTML)
          .join("");
}

// ===== Buat HTML untuk Setiap Todo =====
function createTodoHTML(todo) {
  const createdDate = new Date(todo.createdAt);
  const formattedDate = createdDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const overdue = isOverdue(todo);
  const overdueClass = overdue ? "overdue" : "";
  const completedClass = todo.completed ? "completed" : "";

  return `
      <div class="todo-item ${completedClass} ${overdueClass} bg-white px-3 py-3 md:px-5 md:py-4 rounded-lg mb-2 md:mb-3 shadow border-l-4 ${
    completedClass
      ? "border-green-500 opacity-70 line-through"
      : overdueClass
      ? "border-red-500 bg-red-50"
      : "border-blue-400"
  } transition">
        <div class="flex items-center gap-2 md:gap-3 mb-2">
          <input type="checkbox" class="todo-checkbox align-middle scale-110 md:scale-125 accent-blue-400" ${
            todo.completed ? "checked" : ""
          } onchange="toggleTodo(${todo.id})">
          <div class="todo-text flex-1 text-sm md:text-base flex items-center">${
            todo.text
          }</div>
        </div>
        <div class="flex justify-between items-center text-xs text-gray-500 mt-1 md:mt-2">
          <div>
            <span class="priority-badge px-2 py-1 rounded-full font-bold uppercase text-[10px] ${
              todo.priority === "low"
                ? "bg-green-100 text-green-700"
                : todo.priority === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }">${todo.priority}</span>
            ${
              overdue
                ? '<span class="overdue-badge bg-red-500 text-white px-2 py-1 rounded-full ml-2">Late</span>'
                : ""
            }
          </div>
          <div>${formattedDate}</div>
        </div>
      </div>
    `;
}

// ===== Local Storage: Simpan Data =====
function saveToLocalStorage() {
  try {
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("todoIdCounter", todoIdCounter);
  } catch (e) {
    console.log("LocalStorage error:", e);
  }
}

// ===== Local Storage: Ambil Data =====
function loadFromLocalStorage() {
  try {
    const savedTodos = localStorage.getItem("todos");
    const savedCounter = localStorage.getItem("todoIdCounter");
    if (savedTodos) todos = JSON.parse(savedTodos);
    if (savedCounter) todoIdCounter = parseInt(savedCounter);
  } catch (e) {
    console.log("LocalStorage error:", e);
  }
}

// ===== Jalankan Aplikasi saat Halaman Siap =====
document.addEventListener("DOMContentLoaded", init);
