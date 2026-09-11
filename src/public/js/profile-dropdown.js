/**
 * Profile Dropdown
 * - Toggle open/close on button click
 * - Close when clicking outside
 * - Close with Escape key
 * - Arrow key navigation between items
 * - Proper ARIA attributes
 */
document.addEventListener("DOMContentLoaded", () => {
  const dropdownBtn = document.getElementById("profileDropdownBtn");
  const dropdownMenu = document.getElementById("profileDropdownMenu");
  const dropdownContainer = document.querySelector(".profile-dropdown-container");

  if (!dropdownBtn || !dropdownMenu || !dropdownContainer) return;

  // --- Toggle open/close ---
  function toggleDropdown(forceState) {
    const isOpen = dropdownContainer.classList.contains("open");
    const shouldOpen =
      typeof forceState === "boolean" ? forceState : !isOpen;

    if (shouldOpen) {
      dropdownContainer.classList.add("open");
      dropdownMenu.classList.add("show");
      dropdownBtn.setAttribute("aria-expanded", "true");

      // Focus the first item when opening
      const firstItem = dropdownMenu.querySelector(
        ".profile-dropdown-item, button.profile-dropdown-item"
      );
      if (firstItem) setTimeout(() => firstItem.focus(), 30);
    } else {
      dropdownContainer.classList.remove("open");
      dropdownMenu.classList.remove("show");
      dropdownBtn.setAttribute("aria-expanded", "false");
    }
  }

  function closeDropdown() {
    toggleDropdown(false);
    dropdownBtn.focus();
  }

  // --- Button click ---
  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // --- Click outside ---
  document.addEventListener("click", (e) => {
    if (!dropdownContainer.contains(e.target)) {
      if (dropdownContainer.classList.contains("open")) {
        toggleDropdown(false);
      }
    }
  });

  // --- Keyboard navigation ---
  document.addEventListener("keydown", (e) => {
    const isOpen = dropdownContainer.classList.contains("open");

    if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      closeDropdown();
      return;
    }

    if (!isOpen) return;

    const items = Array.from(
      dropdownMenu.querySelectorAll(
        ".profile-dropdown-item, button.profile-dropdown-item"
      )
    ).filter((el) => el.offsetParent !== null);

    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (e.key === "Tab") {
      // Close dropdown when tabbing out
      toggleDropdown(false);
    }
  });
});