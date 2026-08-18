document.addEventListener("DOMContentLoaded", () => {
  const dropdownBtn = document.getElementById("profileDropdownBtn");
  const dropdownMenu = document.getElementById("profileDropdownMenu");
  const dropdownContainer = document.querySelector(".profile-dropdown-container");

  if (!dropdownBtn || !dropdownMenu || !dropdownContainer) return;

  function toggleDropdown(show) {
    const isCurrentlyOpen = dropdownContainer.classList.contains("open");
    const shouldOpen = typeof show === "boolean" ? show : !isCurrentlyOpen;

    if (shouldOpen) {
      dropdownContainer.classList.add("open");
      dropdownMenu.classList.add("show");
      dropdownBtn.setAttribute("aria-expanded", "true");
    } else {
      dropdownContainer.classList.remove("open");
      dropdownMenu.classList.remove("show");
      dropdownBtn.setAttribute("aria-expanded", "false");
    }
  }

  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener("click", (e) => {
    if (!dropdownContainer.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dropdownContainer.classList.contains("open")) {
      toggleDropdown(false);
      dropdownBtn.focus();
    }
  });
});
