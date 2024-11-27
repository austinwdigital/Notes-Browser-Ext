document.addEventListener("DOMContentLoaded", () => {
  const noteArea = document.getElementById("note");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const app = document.getElementById("app");
  const clearBtn = document.getElementById("clearBtn");
  const exportBtn = document.getElementById("exportBtn");

  // Load saved theme
  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme === "enabled") {
    document.body.classList.add("dark");
    app.classList.add("dark");
    noteArea.classList.add("dark");
    darkModeToggle.checked = true;
  }

  // Toggle dark mode
  darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
      document.body.classList.add("dark");
      app.classList.add("dark");
      noteArea.classList.add("dark");
      localStorage.setItem("darkMode", "enabled");
    } else {
      document.body.classList.remove("dark");
      app.classList.remove("dark");
      noteArea.classList.remove("dark");
      localStorage.setItem("darkMode", "disabled");
    }
  });

  // Clear notes
  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your notes?")) {
      noteArea.value = "";
      localStorage.removeItem("quickNote");
    }
  });

  // Export notes
  exportBtn.addEventListener("click", () => {
    const blob = new Blob([noteArea.value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quick-note.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Save notes to localStorage
  noteArea.value = localStorage.getItem("quickNote") || "";
  noteArea.addEventListener("input", () => {
    localStorage.setItem("quickNote", noteArea.value);
  });
});
