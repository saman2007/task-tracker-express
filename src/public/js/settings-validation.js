document.addEventListener("DOMContentLoaded", async () => {
  let profileSchema = null;
  let passwordSchema = null;

  try {
    const profileMod = await import("/js/validations/updateProfileSchema.shared.js");
    profileSchema = profileMod.updateProfileSchema;

    const passwordMod = await import("/js/validations/updatePasswordSchema.shared.js");
    passwordSchema = passwordMod.updatePasswordSchema;
  } catch (err) {
    console.error("Failed to load settings validation schemas:", err);
    return;
  }

  function setupFormValidation(form, schema) {
    if (!form || !schema) return;

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
        errorEl.innerHTML = `<span style="font-size: 0.85rem;">⚠️</span> <span>${message}</span>`;
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
  }

  const profileForm = document.getElementById("profileInfoForm");
  if (profileForm && profileSchema) {
    setupFormValidation(profileForm, profileSchema);
  }

  const passwordForm = document.getElementById("passwordForm");
  if (passwordForm && passwordSchema) {
    setupFormValidation(passwordForm, passwordSchema);
  }
});

