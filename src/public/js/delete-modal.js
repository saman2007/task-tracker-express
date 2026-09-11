/**
 * Delete Confirmation Modal
 * - Keyboard support (Escape to close)
 * - Click outside to close
 * - Focus trap (Tab cycles only inside modal)
 * - Returns focus to the trigger button when closed
 */
document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById("deleteModalOverlay");
  const deleteForm = document.getElementById("deleteTaskForm");
  const cancelBtn = document.getElementById("cancelDeleteBtn");

  if (!modalOverlay || !deleteForm || !cancelBtn) return;

  let triggerElement = null; // Remember which button opened the modal

  // --- Open Modal ---
  function openModal(taskId, trigger) {
    deleteForm.setAttribute("action", `/tasks/${taskId}/delete`);
    modalOverlay.classList.add("active");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent page scroll

    triggerElement = trigger;

    // Focus the cancel button after a brief delay for transition
    setTimeout(() => cancelBtn.focus(), 50);
  }

  // --- Close Modal ---
  function closeModal() {
    modalOverlay.classList.remove("active");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Return focus to the trigger button
    if (triggerElement && typeof triggerElement.focus === "function") {
      setTimeout(() => triggerElement.focus(), 50);
    }
    triggerElement = null;
  }

  // --- Global click listener: open modal when any ".js-trigger-delete" is clicked ---
  document.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".js-trigger-delete");
    if (deleteBtn) {
      e.preventDefault();
      const taskId = deleteBtn.getAttribute("data-task-id");
      if (taskId) openModal(taskId, deleteBtn);
    }
  });

  // --- Cancel button ---
  cancelBtn.addEventListener("click", closeModal);

  // --- Click outside (on overlay background) ---
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // --- Keyboard handling ---
  document.addEventListener("keydown", (e) => {
    const isOpen = modalOverlay.classList.contains("active");
    if (!isOpen) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }

    // --- Focus trap: keep Tab inside modal ---
    if (e.key === "Tab") {
      const modalCard = modalOverlay.querySelector(".modal-card");
      if (!modalCard) return;

      const focusableSelectors =
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const focusables = Array.from(
        modalCard.querySelectorAll(focusableSelectors)
      ).filter((el) => el.offsetParent !== null); // visible only

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first → go to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last → go to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });
});