document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById("deleteModalOverlay");
  const deleteForm = document.getElementById("deleteTaskForm");
  const cancelBtn = document.getElementById("cancelDeleteBtn");

  document.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".js-trigger-delete");
    if (deleteBtn) {
      e.preventDefault();
      const taskId = deleteBtn.getAttribute("data-task-id");
      if (taskId) {
        deleteForm.setAttribute("action", `/tasks/${taskId}/delete`);
        modalOverlay.classList.add("active");
      }
    }
  });

  const closeModal = () => {
    modalOverlay.classList.remove("active");
  };

  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
});
