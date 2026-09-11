/**
 * TaskTracker — Toast Notification System
 * Neo-brutalist toasts + cross-page feedback via sessionStorage.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "tasktracker-toast";
  const DURATION = 4000;

  const ICONS = {
    success:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    danger:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
    info:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    warning:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };

  function getContainer() {
    return document.getElementById("toastContainer");
  }

  /* ---------- Show / dismiss ---------- */

  function showToast(message, type = "success") {
    const container = getContainer();
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "status");

    toast.innerHTML = `
      <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" type="button" aria-label="Dismiss notification">✕</button>
      <span class="toast-progress" style="animation-duration:${DURATION}ms"></span>
    `;

    container.appendChild(toast);

    toast
      .querySelector(".toast-close")
      .addEventListener("click", () => dismiss(toast));

    setTimeout(() => dismiss(toast), DURATION);
  }

  function dismiss(toast) {
    if (toast.classList.contains("leaving")) return;
    toast.classList.add("leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }

  /* ---------- Cross-page feedback (survives redirects) ---------- */

  function queueToast(message, type) {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ message, type })
      );
    } catch (e) {
      /* storage unavailable */
    }
  }

  function flushQueuedToast() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(STORAGE_KEY);
      const { message, type } = JSON.parse(raw);
      setTimeout(() => showToast(message, type), 350);
    } catch (e) {
      /* ignore */
    }
  }

  /* ---------- Auto-detect actions from forms ---------- */

  function bindForms() {
    document.addEventListener("submit", (e) => {
      const form = e.target;
      if (!form || form.tagName !== "FORM") return;

      const action = form.getAttribute("action") || "";

      // Delete task (modal)
      if (form.id === "deleteTaskForm") {
        queueToast("Task deleted.", "danger");
        return;
      }

      // Toggle complete / pending
      if (action.includes("/toggle")) {
        const btn = form.querySelector("button[type='submit']");
        if (btn && btn.classList.contains("btn-toggle")) {
          queueToast("Nice! Task completed.", "success");
        } else {
          queueToast("Task moved back to pending.", "info");
        }
        return;
      }

      // Create task
      if (action.endsWith("/tasks/add")) {
        queueToast("Task created!", "success");
        return;
      }

      // Edit task
      if (action.includes("/edit")) {
        queueToast("Task updated!", "success");
        return;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindForms();
    flushQueuedToast();
  });

  // Manual use: window.showToast("Hello!", "info")
  window.showToast = showToast;
})();