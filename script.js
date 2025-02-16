// Ambil referensi elemen
const inputBox           = document.getElementById("input-box");
const listContainer      = document.getElementById("list-container");
const categorySelect     = document.getElementById("category");
const filterSelect       = document.getElementById("filter");
const completedCounter   = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const clearAllButton     = document.getElementById("clear-all");
const darkModeButton     = document.getElementById("dark-mode-toggle");

// Toggle Dark Mode
darkModeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Simpan tugas ke Local Storage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#list-container li").forEach(li => {
    tasks.push({
      text      : li.querySelector(".task-text").innerText,
      completed : li.classList.contains("completed"),
      category  : li.dataset.category,
      color     : li.style.backgroundColor
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Muat tugas dari Local Storage
function loadTasks() {
  const storedTasks = localStorage.getItem("tasks");
  if (storedTasks) {
    JSON.parse(storedTasks).forEach(task => {
      addTask(task.text, task.category, task.completed, task.color, false);
    });
  }
  updateCounter();
}

// Fungsi untuk menambahkan tugas dari input (klik tombol "Tambah")
function addTaskFromInput() {
  const taskText     = inputBox.value.trim();
  const taskCategory = categorySelect.value;
  if (!taskText) return;
  addTask(taskText, taskCategory);
}

// Fungsi utama untuk menambahkan tugas
function addTask(taskText, taskCategory, completed = false, color = "", save = true) {
  if (!taskText) return;

  const li = document.createElement("li");
  li.dataset.category = taskCategory;
  li.style.backgroundColor = color;

  li.innerHTML = `
    <label style="flex: 1; display: flex; align-items: center;">
      <input type="checkbox" class="task-checkbox" ${completed ? "checked" : ""}>
      <span class="task-text">${taskText} <small>(${taskCategory})</small></span>
    </label>
    <div class="button-group">
      <button class="edit-btn">✏️</button>
      <button class="delete-btn">❌</button>
    </div>
  `;

  // Tandai jika sudah selesai
  if (completed) {
    li.classList.add("completed");
  }

  // Tambahkan elemen li ke dalam list
  listContainer.appendChild(li);
  inputBox.value = "";

  // Simpan data jika diperlukan
  if (save) saveTasks();
  updateCounter();

  // Event Listener untuk checkbox
  const checkbox = li.querySelector(".task-checkbox");
  checkbox.addEventListener("change", function () {
    li.classList.toggle("completed", checkbox.checked);
    saveTasks();
    updateCounter();
    filterTasks(); // Refresh tampilan setelah status berubah
  });

  // Edit Tugas
  li.querySelector(".edit-btn").addEventListener("click", function () {
    const currentText = li.querySelector(".task-text").innerText;
    // Hapus teks kategori dari prompt
    const newText = prompt("Edit tugas:", currentText.replace(/\s*.*\s*/g, ''));
    if (newText) {
      // Tetap gunakan category lama (tidak diubah)
      li.querySelector(".task-text").innerHTML = `${newText} <small>(${taskCategory})</small>`;
      saveTasks();
    }
  });

  // Hapus Tugas
  li.querySelector(".delete-btn").addEventListener("click", function () {
    if (confirm("Hapus tugas ini?")) {
      li.remove();
      saveTasks();
      updateCounter();
    }
  });

  // Filter ulang agar tugas yang baru tetap sesuai filter aktif
  filterTasks();
}

// Fungsi Filter Tugas
function filterTasks() {
  const filterValue = filterSelect.value;
  document.querySelectorAll("#list-container li").forEach(li => {
    const category    = li.dataset.category;
    const isCompleted = li.classList.contains("completed");

    // Filter "all" -> Tampilkan semua
    if (filterValue === "all") {
      li.style.display = "flex";
    }
    // Filter "completed" -> Tampilkan hanya yang selesai
    else if (filterValue === "completed") {
      li.style.display = isCompleted ? "flex" : "none";
    }
    // Filter berdasarkan kategori
    else if (category === filterValue) {
      li.style.display = "flex";
    }
    // Jika tidak sesuai filter, sembunyikan
    else {
      li.style.display = "none";
    }
  });
}

// Fungsi untuk menghitung jumlah tugas selesai/belum selesai
function updateCounter() {
  const totalTasks     = document.querySelectorAll("#list-container li").length;
  const completedTasks = document.querySelectorAll("#list-container li.completed").length;
  const uncompleted    = totalTasks - completedTasks;

  completedCounter.innerText   = completedTasks;
  uncompletedCounter.innerText = uncompleted;
}

// Event Listener untuk filter dropdown
filterSelect.addEventListener("change", function () {
  filterTasks();
});

// Event Listener untuk tombol "Hapus Semua"
clearAllButton.addEventListener("click", () => {
  if (confirm("Hapus semua tugas?")) {
    listContainer.innerHTML = "";
    localStorage.removeItem("tasks");
    updateCounter();
  }
});

// Panggil fungsi loadTasks saat halaman dimuat
window.onload = loadTasks;