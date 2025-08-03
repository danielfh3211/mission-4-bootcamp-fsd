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
const dueDateInput = document.getElementById("dueDate");
const filterDateInput = document.getElementById("filterDate");
const clearFilterBtn = document.getElementById("clearFilterBtn");

// ===== Toast Notification =====
function showToast(message, color = "bg-blue-600") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold text-base
    transition-all duration-300 ease-out transform scale-90 opacity-0 ${color}`;
  toast.style.display = "block";
  setTimeout(() => {
    toast.className = `fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold text-base
      transition-all duration-300 ease-out transform scale-100 opacity-100 ${color}`;
  }, 10);
  setTimeout(() => {
    toast.className = `fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-semibold text-base
      transition-all duration-300 ease-in transform scale-90 opacity-0 ${color}`;
  }, 2000);
  setTimeout(() => {
    toast.style.display = "none";
  }, 2300);
}

// ===== Custom Confirm Modal =====
function showConfirm(message, callback) {
  const modal = document.getElementById("confirmModal");
  const box = document.getElementById("confirmBox");
  const msg = document.getElementById("confirmMessage");
  const yesBtn = document.getElementById("confirmYes");
  const noBtn = document.getElementById("confirmNo");

  msg.textContent = message;
  modal.style.display = "flex";
  setTimeout(() => {
    box.classList.remove("scale-95", "opacity-0");
    box.classList.add("scale-100", "opacity-100");
  }, 10);

  function closeModal() {
    box.classList.remove("scale-100", "opacity-100");
    box.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  }

  yesBtn.onclick = () => {
    closeModal();
    callback(true);
  };
  noBtn.onclick = () => {
    closeModal();
    callback(false);
  };
}

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

  filterDateInput.addEventListener("change", renderTodos);
  clearFilterBtn.addEventListener("click", () => {
    filterDateInput.value = "";
    renderTodos();
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
  const hour = now.getHours().toString().padStart(2, "0");
  const minute = now.getMinutes().toString().padStart(2, "0");
  const second = now.getSeconds().toString().padStart(2, "0");
  document.getElementById(
    "currentDate"
  ).textContent = `${dayName}, ${day} ${month} ${year} ${hour}:${minute}:${second}`;
}

// ===== Tambahkan Todo Baru =====
function addTodo() {
  const text = todoText.value.trim();
  const priority = document.getElementById("priority").value;
  const dueDate = dueDateInput.value;

  if (!text) {
    showToast("Silakan masukkan tugas terlebih dahulu!", "bg-red-500");
    return;
  }
  if (!dueDate) {
    showToast("Silakan pilih tanggal deadline!", "bg-red-500");
    return;
  }
  if (!priority) {
    showToast("Silakan pilih level prioritas!", "bg-red-500");
    return;
  }

  const todo = {
    id: todoIdCounter++,
    text,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate,
    completedAt: null,
  };

  todos.push(todo);
  todoText.value = "";
  document.getElementById("priority").value = "";
  dueDateInput.value = "";

  saveToLocalStorage();
  renderTodos();
  showToast("Tugas berhasil ditambahkan!", "bg-green-500");
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

// ===== Hapus Todo =====
function deleteTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  showConfirm(
    `Apakah anda yakin ingin menghapus tugas: "${todo.text}"?`,
    function (result) {
      if (result) {
        todos = todos.filter((todo) => todo.id !== id);
        saveToLocalStorage();
        renderTodos();
        showToast("Tugas berhasil dihapus!", "bg-red-500");
      }
    }
  );
}

// ===== Hapus Semua Todo =====
function deleteAllTodos() {
  if (todos.length === 0) {
    showToast("Tidak ada tugas untuk dihapus!", "bg-yellow-500");
    return;
  }
  showConfirm(
    "Apakah anda yakin ingin menghapus semua tugas?",
    function (result) {
      if (result) {
        todos = [];
        saveToLocalStorage();
        renderTodos();
        showToast("Semua tugas berhasil dihapus!", "bg-red-500");
      }
    }
  );
}

// ===== Cek apakah Todo sudah Overdue =====
function isOverdue(todo) {
  if (todo.completed || !todo.dueDate) return false;
  return new Date() > new Date(todo.dueDate);
}

// ===== Tampilkan Todo di Halaman =====
function renderTodos() {
  let filteredTodos = todos;
  const filterDate = filterDateInput.value;
  if (filterDate) {
    filteredTodos = todos.filter((todo) => {
      if (!todo.dueDate) return false;
      return todo.dueDate.split("T")[0] === filterDate;
    });
  }

  const activeTodos = filteredTodos.filter((todo) => !todo.completed);
  const overdueTodos = activeTodos.filter(isOverdue);
  const regularTodos = activeTodos.filter((todo) => !isOverdue(todo));
  const completedTodos = filteredTodos.filter((todo) => todo.completed);

  todoCount.textContent = regularTodos.length;
  overdueCount.textContent = overdueTodos.length;
  doneCount.textContent = completedTodos.length;

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

  overdueList.innerHTML =
    overdueTodos.length === 0
      ? '<div class="empty-state">Tidak ada tugas yang terlambat. Bagus!</div>'
      : overdueTodos
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(createTodoHTML)
          .join("");

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
  const deadlineDate = todo.dueDate
    ? new Date(todo.dueDate).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const overdue = isOverdue(todo);
  const overdueClass = overdue ? "overdue" : "";
  const completedClass = todo.completed ? "line-through opacity-70" : "";

  return `
    <div class="todo-item bg-white px-3 py-3 md:px-5 md:py-4 rounded-lg mb-2 md:mb-3 shadow border-l-4 ${
      overdueClass ? "border-red-500 bg-red-50" : "border-blue-400"
    } transition">
      <div class="flex items-center gap-2 md:gap-3 mb-2">
        <input type="checkbox" class="todo-checkbox align-middle scale-110 md:scale-125 accent-blue-400" ${
          todo.completed ? "checked" : ""
        } onchange="toggleTodo(${todo.id})">
        <div class="todo-text flex-1 text-sm md:text-base flex items-center ${completedClass}">${
    todo.text
  }</div>
        <button onclick="deleteTodo(${
          todo.id
        })" title="Hapus" class="ml-2 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded transition flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"/>
          </svg>
          Hapus
        </button>
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
        <div>
          <span>Deadline: ${deadlineDate}</span>
        </div>
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

document.addEventListener("DOMContentLoaded", init);
