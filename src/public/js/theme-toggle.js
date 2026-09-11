/**
 * Theme Toggle — bulletproof v2
 * Persists via localStorage AND cookie (double safety).
 * Re-applies on every navigation event (load, DOMContentLoaded, pageshow/bfcache).
 */
(function () {
  "use strict";

  const LS_KEY = "tasktracker-theme";
  const COOKIE = "tt-theme";
  const root = document.documentElement;

  /* ---------- Read saved (ls → cookie → null) ---------- */
  function readSaved() {
    try {
      const s = localStorage.getItem(LS_KEY);
      if (s === "dark" || s === "light") return s;
    } catch (e) {
      /* storage blocked */
    }
    const m = document.cookie.match(/(?:^|;\s*)tt-theme=(dark|light)/);
    return m ? m[1] : null;
  }

  /* ---------- Persist to BOTH stores ---------- */
  function persist(theme) {
    try {
      localStorage.setItem(LS_KEY, theme);
    } catch (e) {
      /* ignore */
    }
    try {
      document.cookie =
        COOKIE + "=" + theme + "; path=/; max-age=31536000; SameSite=Lax";
    } catch (e) {
      /* ignore */
    }
  }

  let transitionTimer = null;

  /* ---------- Apply everywhere ---------- */
  function applyTheme(theme, save) {
    if (save) {
      root.classList.add("theme-transitioning");
      clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => {
        root.classList.remove("theme-transitioning");
      }, 350);
    }

    root.setAttribute("data-theme", theme);
    const meta = document.getElementById("metaThemeColor");
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#2a2b31" : "#f3eee3");
    }

    document.querySelectorAll(".nav-theme-toggle").forEach((btn) => {
      btn.setAttribute("data-theme", theme);
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    });

    if (save) persist(theme);
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function initTheme() {
    const saved = readSaved();
    const theme =
      saved ||
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    applyTheme(theme, false);
  }

  /* ---------- Boot + safety nets on every navigation ---------- */
  initTheme();
  window.addEventListener("DOMContentLoaded", initTheme);
  window.addEventListener("pageshow", initTheme); // bfcache restores

  /* ---------- Delegated click ---------- */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-theme-toggle");
    if (!btn) return;
    applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
  });

  /* ---------- Follow OS only when user hasn't chosen ---------- */
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener
  ) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!readSaved()) applyTheme(e.matches ? "dark" : "light", false);
      });
  }
})();