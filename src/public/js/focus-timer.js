/**
 * focus-timer.js — Active Pomodoro Timer & Activity Analytics Engine
 * Precise time calculation, Web Audio chimes, custom task select, and instant AJAX updates.
 */
(function () {
  "use strict";

  // Elements
  const timerDigits = document.getElementById("timerDigits");
  const timerStatus = document.getElementById("timerStatus");
  const progressFill = document.getElementById("timerProgressFill");
  const btnStart = document.getElementById("btnTimerStart");
  const btnPause = document.getElementById("btnTimerPause");
  const btnStop = document.getElementById("btnTimerStop");
  const btnReset = document.getElementById("btnTimerReset");
  const soundToggle = document.getElementById("soundToggle");
  const modeButtons = document.querySelectorAll(".mode-pill-btn");
  const stepperButtons = document.querySelectorAll(".stepper-btn");
  const logsList = document.getElementById("logsList");
  const logsCount = document.getElementById("logsCountBadge");

  // Summary Stat chips
  const statTotalHours = document.getElementById("statTotalHours");
  const statTodayHours = document.getElementById("statTodayHours");
  const statSessionsCount = document.getElementById("statSessionsCount");
  const logsTodayVal = document.getElementById("logsTodayVal");
  const logsSessionsVal = document.getElementById("logsSessionsVal");
  const logsTotalVal = document.getElementById("logsTotalVal");

  // Custom Select Elements
  const customSelectContainer = document.getElementById("taskCustomSelect");
  const customSelectTrigger = document.getElementById("customSelectTrigger");
  const customSelectDropdown = document.getElementById("customSelectDropdown");
  const customSelectSearch = document.getElementById("customSelectSearch");
  const customSelectOptions = document.getElementById("customSelectOptions");
  const selectedTaskContent = document.getElementById("selectedTaskContent");
  const hiddenTaskSelect = document.getElementById("focusTaskSelect");

  // Mode defaults in minutes
  const DEFAULT_DURATIONS = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
  };

  const STORAGE_KEY = "tasktracker_focus_timer_state";
  const SOUND_KEY = "tasktracker_sound_enabled";

  // State
  let currentMode = "focus"; // "focus" | "shortBreak" | "longBreak"
  let totalSeconds = DEFAULT_DURATIONS.focus * 60;
  let remainingSeconds = totalSeconds;
  let timerInterval = null;
  let targetEndTime = null;
  let isRunning = false;
  let isPaused = false;
  let soundEnabled = localStorage.getItem(SOUND_KEY) !== "false";

  // Selected task state
  let selectedTaskId = "";
  let selectedTaskTitle = "General Focus (No task linked)";
  let selectedTaskPriority = "";

  // Web Audio Context for pleasant chime
  let audioCtx = null;

  function playChime() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      // Primary harmonic bell
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 1.2);

      // Secondary crystal harmonic
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1174.66, now + 0.15); // D6

      gain2.gain.setValueAtTime(0.2, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);

      osc2.start(now + 0.15);
      osc2.stop(now + 1.6);
    } catch (e) {
      console.warn("Audio chime unsupported:", e);
    }
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function updateDisplay() {
    if (!timerDigits) return;
    timerDigits.textContent = formatTime(remainingSeconds);

    // Progress
    const elapsed = totalSeconds - remainingSeconds;
    const pct = totalSeconds > 0 ? Math.min(100, Math.max(0, (elapsed / totalSeconds) * 100)) : 0;
    if (progressFill) {
      progressFill.style.width = `${pct}%`;
      progressFill.className = `timer-progress-fill ${currentMode !== "focus" ? "break" : ""}`;
    }

    // Status Badge
    if (timerStatus) {
      if (isRunning) {
        timerStatus.textContent = currentMode === "focus" ? "Focusing" : "Break Time";
        timerStatus.className = `timer-status-badge ${currentMode !== "focus" ? "break" : ""}`;
      } else if (isPaused) {
        timerStatus.textContent = "Paused";
        timerStatus.className = "timer-status-badge paused";
      } else {
        timerStatus.textContent = "Ready";
        timerStatus.className = "timer-status-badge";
      }
    }

    // Tab title notification
    if (isRunning) {
      document.title = `(${formatTime(remainingSeconds)}) Focus | TaskTracker`;
    } else {
      document.title = "Focus Timer & Sessions | TaskTracker";
    }

    // Controls
    if (btnStart) btnStart.style.display = isRunning ? "none" : "inline-flex";
    if (btnPause) {
      btnPause.style.display = isRunning ? "inline-flex" : "none";
      btnPause.innerHTML = `<span>Pause</span>`;
    }

    saveState();
  }

  function setMode(mode, customMinutes) {
    if (isRunning && !confirm("A session is currently running. Switch modes?")) {
      return;
    }

    clearInterval(timerInterval);
    isRunning = false;
    isPaused = false;

    currentMode = mode;
    const mins = customMinutes || DEFAULT_DURATIONS[mode] || 25;
    totalSeconds = mins * 60;
    remainingSeconds = totalSeconds;

    modeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    updateDisplay();
  }

  function startTimer() {
    if (isRunning) return;

    isRunning = true;
    isPaused = false;
    targetEndTime = Date.now() + remainingSeconds * 1000;

    clearInterval(timerInterval);
    timerInterval = setInterval(tick, 250);

    updateDisplay();
  }

  function pauseTimer() {
    if (!isRunning) return;

    isRunning = false;
    isPaused = true;
    clearInterval(timerInterval);

    // Save accurate seconds left
    if (targetEndTime) {
      const diff = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000));
      remainingSeconds = diff;
    }

    updateDisplay();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = false;
    remainingSeconds = totalSeconds;
    updateDisplay();
  }

  async function stopAndSave(completed = false) {
    clearInterval(timerInterval);

    const elapsedSeconds = totalSeconds - remainingSeconds;
    const elapsedMinutes = Math.round(elapsedSeconds / 60);

    isRunning = false;
    isPaused = false;

    if (completed) {
      playChime();
      if (window.showToast) {
        window.showToast("Focus session completed. Great job!", "success");
      }
    }

    // Only record if at least 1 minute was spent
    if (elapsedMinutes >= 1) {
      const taskId = selectedTaskId ? Number(selectedTaskId) : null;
      const taskTitle = selectedTaskTitle || "General Focus";

      await recordSession({
        durationMinutes: elapsedMinutes,
        taskId,
        taskTitle,
        mode: currentMode,
      });
    }

    remainingSeconds = totalSeconds;
    updateDisplay();
  }

  function tick() {
    if (!isRunning || !targetEndTime) return;

    const now = Date.now();
    const diff = Math.max(0, Math.round((targetEndTime - now) / 1000));
    remainingSeconds = diff;

    if (remainingSeconds <= 0) {
      stopAndSave(true);
      return;
    }

    updateDisplay();
  }

  // Steppers (+1m, -1m, +5m, -5m)
  function adjustDuration(minutesDelta) {
    if (isRunning) return;

    const newMins = Math.max(1, Math.min(120, Math.round(totalSeconds / 60) + minutesDelta));
    totalSeconds = newMins * 60;
    remainingSeconds = totalSeconds;
    updateDisplay();
  }

  // ── Custom Select Component Logic ────────────────────────────────────────
  function setupCustomSelect() {
    if (!customSelectContainer || !customSelectTrigger) return;

    // Toggle open
    customSelectTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = customSelectContainer.classList.toggle("open");
      customSelectTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen && customSelectSearch) {
        customSelectSearch.value = "";
        filterOptions("");
        setTimeout(() => customSelectSearch.focus(), 50);
      }
    });

    // Option selection
    if (customSelectOptions) {
      customSelectOptions.addEventListener("click", (e) => {
        const opt = e.target.closest(".custom-select-option");
        if (!opt) return;

        selectOption(opt.dataset.value, opt.dataset.title, opt.dataset.priority);
        closeCustomSelect();
      });
    }

    // Search filter
    if (customSelectSearch) {
      customSelectSearch.addEventListener("input", (e) => {
        filterOptions(e.target.value);
      });
      // Prevent clicking input from closing dropdown
      customSelectSearch.addEventListener("click", (e) => e.stopPropagation());
    }

    // Click outside to close
    document.addEventListener("click", (e) => {
      if (!customSelectContainer.contains(e.target)) {
        closeCustomSelect();
      }
    });

    // Escape key closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && customSelectContainer.classList.contains("open")) {
        closeCustomSelect();
        customSelectTrigger.focus();
      }
    });
  }

  function closeCustomSelect() {
    if (!customSelectContainer) return;
    customSelectContainer.classList.remove("open");
    if (customSelectTrigger) {
      customSelectTrigger.setAttribute("aria-expanded", "false");
    }
  }

  function filterOptions(query) {
    if (!customSelectOptions) return;
    const q = query.trim().toLowerCase();
    const options = customSelectOptions.querySelectorAll(".custom-select-option");
    let visibleCount = 0;

    options.forEach((opt) => {
      const text = (opt.dataset.title || "").toLowerCase();
      const priority = (opt.dataset.priority || "").toLowerCase();
      const matches = !q || text.includes(q) || priority.includes(q);
      opt.style.display = matches ? "flex" : "none";
      if (matches) visibleCount++;
    });

    // Empty indicator
    let noResults = customSelectOptions.querySelector(".custom-select-no-results");
    if (visibleCount === 0) {
      if (!noResults) {
        noResults = document.createElement("div");
        noResults.className = "custom-select-no-results";
        noResults.textContent = "No tasks found";
        customSelectOptions.appendChild(noResults);
      }
    } else if (noResults) {
      noResults.remove();
    }
  }

  function selectOption(id, title, priority) {
    selectedTaskId = id || "";
    selectedTaskTitle = title || "General Focus (No task linked)";
    selectedTaskPriority = priority || "";

    if (hiddenTaskSelect) {
      hiddenTaskSelect.value = selectedTaskId;
    }

    // Update Trigger UI
    if (selectedTaskContent) {
      if (selectedTaskPriority) {
        selectedTaskContent.innerHTML = `
          <span class="selected-priority-badge badge-${escapeHtml(selectedTaskPriority)}">${escapeHtml(selectedTaskPriority)}</span>
          <span class="selected-text">${escapeHtml(selectedTaskTitle)}</span>
        `;
      } else {
        selectedTaskContent.innerHTML = `
          <span class="selected-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span>
          <span class="selected-text">${escapeHtml(selectedTaskTitle)}</span>
        `;
      }
    }

    // Update .selected class on options
    if (customSelectOptions) {
      customSelectOptions.querySelectorAll(".custom-select-option").forEach((opt) => {
        const isMatch = opt.dataset.value === selectedTaskId;
        opt.classList.toggle("selected", isMatch);
        opt.setAttribute("aria-selected", isMatch ? "true" : "false");
      });
    }

    saveState();
  }

  // ── Record Session to Server via AJAX ─────────────────────────────────────
  async function recordSession(payload) {
    try {
      const res = await fetch("/api/focus/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save session");
      const data = await res.json();

      if (data.session) {
        prependSessionLog(data.session);
        refreshStats();
      }
    } catch (e) {
      console.error("Session record failed:", e);
      if (window.showToast) {
        window.showToast("Could not save session to server", "error");
      }
    }
  }

  function prependSessionLog(s) {
    if (!logsList) return;

    // Remove empty placeholder if present
    const emptyEl = logsList.querySelector(".logs-empty");
    if (emptyEl) emptyEl.remove();

    const isFocus = s.mode === "focus";
    const modeLabel = isFocus ? "Focus" : s.mode === "shortBreak" ? "Short Break" : "Long Break";
    const modeClass = isFocus ? "focus" : "break";

    const item = document.createElement("div");
    item.className = "log-item";
    item.id = `log-item-${s.id}`;
    item.innerHTML = `
      <div class="log-left">
        <div class="log-mode-icon ${modeClass}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="log-meta">
          <div class="log-title">${escapeHtml(s.taskTitle || "General Focus")}</div>
          <div class="log-timestamp">Just now • ${modeLabel}</div>
        </div>
      </div>
      <div class="log-right">
        <span class="log-duration">${s.durationMinutes}m</span>
        <button class="log-delete-btn" type="button" data-id="${s.id}" title="Delete log">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    logsList.prepend(item);

    if (logsCount) {
      const current = parseInt(logsCount.textContent, 10) || 0;
      logsCount.textContent = `${current + 1}`;
    }
  }

  async function refreshStats() {
    try {
      const res = await fetch("/api/focus/stats", {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return;
      const data = await res.json();

      // Update header stat chips
      if (statTotalHours) {
        statTotalHours.textContent = `${(data.totalMinutes / 60).toFixed(1)}h`;
      }
      if (statTodayHours && data.todayMinutes !== undefined) {
        statTodayHours.textContent = `${(data.todayMinutes / 60).toFixed(1)}h`;
      }
      if (statSessionsCount) {
        statSessionsCount.textContent = data.sessionsCount;
      }

      // Update mini logs summary boxes
      if (logsTodayVal && data.todayMinutes !== undefined) {
        logsTodayVal.textContent = `${(data.todayMinutes / 60).toFixed(1)}h`;
      }
      if (logsSessionsVal) {
        logsSessionsVal.textContent = data.sessionsCount;
      }
      if (logsTotalVal) {
        logsTotalVal.textContent = `${(data.totalMinutes / 60).toFixed(1)}h`;
      }

      // Update 7-Day Chart Bars
      if (data.daily && Array.isArray(data.daily)) {
        const maxMin = Math.max(...data.daily.map((d) => d.minutes), 120);
        data.daily.forEach((day, idx) => {
          const stem = document.getElementById(`bar-fill-${idx}`);
          const val = document.getElementById(`bar-val-${idx}`);
          if (stem) {
            const hPct = day.minutes > 0 ? Math.max(6, Math.round((day.minutes / maxMin) * 100)) : 0;
            stem.style.height = day.minutes > 0 ? `${hPct}%` : "";
            stem.classList.toggle("empty", day.minutes === 0);
            stem.classList.toggle("target-reached", day.minutes >= 120);
          }
          if (val) {
            val.textContent = `${day.minutes}m (${day.minutes > 0 ? (day.minutes / 60).toFixed(1) + 'h' : '0h'})`;
          }
        });
      }

      // Update Task Distribution Breakdown
      if (data.tasks && Array.isArray(data.tasks)) {
        updateTaskDistDOM(data.tasks);
      }
    } catch (e) {
      console.warn("Stats refresh failed:", e);
    }
  }

  function updateTaskDistDOM(tasks) {
    const stackedBar = document.getElementById("taskDistStackedBar");
    const listWrap = document.getElementById("taskDistList");

    if (stackedBar) {
      if (tasks.length > 0) {
        stackedBar.innerHTML = tasks
          .map(
            (t) =>
              `<div class="dist-segment" style="width: ${t.percentage}%; background-color: ${t.color};" title="${escapeHtml(t.taskTitle)}: ${t.percentage}% (${t.minutes}m)"></div>`
          )
          .join("");
      } else {
        stackedBar.innerHTML = `<div class="dist-segment" style="width: 100%; background-color: var(--surface-3);" title="No focus time logged yet"></div>`;
      }
    }

    if (listWrap) {
      if (tasks.length > 0) {
        listWrap.innerHTML = tasks
          .map(
            (t) => `
            <div class="dist-item">
              <div class="dist-item-left">
                <span class="dist-color-box" style="background-color: ${t.color};"></span>
                <span class="dist-task-title">${escapeHtml(t.taskTitle)}</span>
              </div>
              <div class="dist-item-right">
                <span class="dist-time">${t.minutes}m</span>
                <span class="dist-pct-badge">${t.percentage}%</span>
              </div>
            </div>
          `
          )
          .join("");
      } else {
        listWrap.innerHTML = `<p class="chart-subtitle" style="text-align: center; padding: 1.5rem 0;">No task focus distribution yet.</p>`;
      }
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ── State Persistence ────────────────────────────────────────────────────
  function saveState() {
    try {
      const state = {
        currentMode,
        totalSeconds,
        remainingSeconds,
        isRunning,
        isPaused,
        targetEndTime: isRunning ? targetEndTime : null,
        selectedTaskId,
        selectedTaskTitle,
        selectedTaskPriority,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);

      if (state.currentMode && DEFAULT_DURATIONS[state.currentMode]) {
        currentMode = state.currentMode;
        modeButtons.forEach((btn) => {
          btn.classList.toggle("active", btn.dataset.mode === currentMode);
        });
      }

      totalSeconds = state.totalSeconds || DEFAULT_DURATIONS[currentMode] * 60;

      if (state.isRunning && state.targetEndTime) {
        const now = Date.now();
        const diff = Math.round((state.targetEndTime - now) / 1000);
        if (diff > 0) {
          remainingSeconds = diff;
          targetEndTime = state.targetEndTime;
          isRunning = true;
          isPaused = false;
          clearInterval(timerInterval);
          timerInterval = setInterval(tick, 250);
        } else {
          // Completed while tab was closed
          remainingSeconds = 0;
          stopAndSave(true);
        }
      } else if (state.isPaused && typeof state.remainingSeconds === "number") {
        remainingSeconds = Math.max(0, state.remainingSeconds);
        isPaused = true;
        isRunning = false;
      } else {
        remainingSeconds = totalSeconds;
      }

      if (state.selectedTaskId !== undefined) {
        selectOption(state.selectedTaskId, state.selectedTaskTitle, state.selectedTaskPriority);
      }

      updateDisplay();
    } catch (e) {}
  }

  // ── Wire Listeners ───────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    setupCustomSelect();

    // Mode Buttons
    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        setMode(btn.dataset.mode);
      });
    });

    // Controls
    if (btnStart) btnStart.addEventListener("click", startTimer);
    if (btnPause) btnPause.addEventListener("click", pauseTimer);
    if (btnStop) {
      btnStop.addEventListener("click", () => {
        if (confirm("End and log current focus session?")) {
          stopAndSave(false);
        }
      });
    }
    if (btnReset) btnReset.addEventListener("click", resetTimer);

    // Steppers
    stepperButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const delta = parseInt(btn.dataset.delta, 10) || 0;
        adjustDuration(delta);
      });
    });

    // Sound toggle
    if (soundToggle) {
      soundToggle.classList.toggle("muted", !soundEnabled);
      soundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem(SOUND_KEY, soundEnabled ? "true" : "false");
        soundToggle.classList.toggle("muted", !soundEnabled);
        if (window.showToast) {
          window.showToast(soundEnabled ? "Sound alerts enabled" : "Sound alerts muted", "info");
        }
      });
    }

    // Delegated delete log handler
    if (logsList) {
      logsList.addEventListener("click", async (e) => {
        const btn = e.target.closest(".log-delete-btn");
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;

        if (!confirm("Delete this focus log entry?")) return;

        try {
          const res = await fetch(`/api/focus/sessions/${id}`, {
            method: "DELETE",
            headers: { Accept: "application/json" },
          });

          if (res.ok) {
            const item = document.getElementById(`log-item-${id}`);
            if (item) {
              item.style.opacity = "0";
              item.style.transform = "translateX(20px)";
              item.style.transition = "opacity 0.25s, transform 0.25s";
              setTimeout(() => {
                item.remove();
                if (logsCount) {
                  const current = parseInt(logsCount.textContent, 10) || 1;
                  logsCount.textContent = `${Math.max(0, current - 1)}`;
                }
              }, 250);
            }
            refreshStats();
          }
        } catch (err) {
          console.error("Failed to delete log:", err);
        }
      });
    }

    restoreState();
    updateDisplay();
  });
})();
