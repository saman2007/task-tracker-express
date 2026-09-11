document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector(".task-form");
  if (!form) return;

  let schema = null;

  try {
    const mod = await import("/js/validations/taskSchema.shared.js");
    schema = mod.taskSchema;
  } catch (err) {
    console.error("Failed to load validation schema:", err);
    return;
  }

  if (!schema) return;

  let hasSubmitted = false;

  function clearAllErrors() {
    form.querySelectorAll(".is-invalid").forEach((input) => {
      input.classList.remove("is-invalid");
    });

    form.querySelectorAll(".form-error-msg").forEach((msg) => {
      msg.remove();
    });
  }

  function showFieldError(fieldName, message) {
    const input = form.querySelector(`[name="${fieldName}"]`);

    if (!input) return;

    input.classList.add("is-invalid");

    const formGroup = input.closest(".form-group");

    if (formGroup) {
      let errorEl = formGroup.querySelector(".form-error-msg");

      if (!errorEl) {
        errorEl = document.createElement("p");
        errorEl.className = "form-error-msg";

        formGroup.appendChild(errorEl);
      }

      errorEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> <span>${message}</span>`;
    }
  }

  function validate() {
    const rawData = Object.fromEntries(new FormData(form).entries());
    const result = schema.safeParse(rawData);

    clearAllErrors();

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];

        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });

      for (const [fieldName, message] of Object.entries(fieldErrors)) {
        showFieldError(fieldName, message);
      }

      return false;
    }

    return true;
  }

  form.addEventListener("input", () => {
    if (hasSubmitted) {
      validate();
    }
  });

  form.addEventListener("change", () => {
    if (hasSubmitted) {
      validate();
    }
  });

  form.addEventListener("submit", (e) => {
    hasSubmitted = true;
    const isValid = validate();

    if (!isValid) {
      e.preventDefault();

      const firstInvalid = form.querySelector(".is-invalid");

      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
  });
});
