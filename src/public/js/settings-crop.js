document.addEventListener("DOMContentLoaded", () => {
  const avatarInput = document.getElementById("avatarInput");
  const avatarEditBtn = document.getElementById("avatarEditBtn");
  const avatarPreview = document.getElementById("avatarPreview");
  const avatarFlashContainer = document.getElementById("avatarFlashContainer");
  const avatarForm = document.getElementById("avatarForm");
  const avatarCroppedFile = document.getElementById("avatarCroppedFile");

  // Modal elements
  const cropModal = document.getElementById("cropModal");
  const cropModalClose = document.getElementById("cropModalClose");
  const cropCancelBtn = document.getElementById("cropCancelBtn");
  const cropApplyBtn = document.getElementById("cropApplyBtn");
  const cropImage = document.getElementById("cropImage");
  const cropBox = document.getElementById("cropBox");
  const cropSizeSlider = document.getElementById("cropSizeSlider");

  if (!avatarInput || !avatarEditBtn || !cropModal || !cropImage || !cropBox) return;

  let naturalWidth = 0;
  let naturalHeight = 0;
  let displayedWidth = 0;
  let displayedHeight = 0;

  let cropX = 0;
  let cropY = 0;
  let cropSize = 150;

  let isMoving = false;
  let isResizing = false;
  let activeHandle = null;

  let startPointerX = 0;
  let startPointerY = 0;
  let startCropX = 0;
  let startCropY = 0;
  let startCropSize = 0;

  function showAvatarAlert(message, type = "error") {
    if (!avatarFlashContainer) return;
    avatarFlashContainer.innerHTML = `
      <div class="auth-flash-banner ${type === "success" ? "success" : ""}">
        <svg class="flash-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${
            type === "success"
              ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
              : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
          }
        </svg>
        <span class="flash-message">${message}</span>
      </div>
    `;
  }

  function clearAvatarAlert() {
    if (avatarFlashContainer) {
      avatarFlashContainer.innerHTML = "";
    }
  }

  avatarEditBtn.addEventListener("click", () => {
    clearAvatarAlert();
    avatarInput.click();
  });

  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Validate image format (PNG, JPG, JPEG only)
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!validTypes.includes(file.type)) {
      showAvatarAlert("Please select a valid image file (PNG, JPG, JPEG).", "error");
      avatarInput.value = "";
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showAvatarAlert("Image file size exceeds 5MB limit. Please choose a smaller image.", "error");
      avatarInput.value = "";
      return;
    }

    clearAvatarAlert();

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      openCropModal(loadEvt.target.result);
    };
    reader.readAsDataURL(file);
  });

  function openCropModal(src) {
    cropImage.src = src;
    cropModal.classList.add("active");

    cropImage.onload = () => {
      naturalWidth = cropImage.naturalWidth;
      naturalHeight = cropImage.naturalHeight;

      // Small delay to ensure image rendered size is computed accurately
      requestAnimationFrame(() => {
        initCropBox();
      });
    };
  }

  function initCropBox() {
    displayedWidth = cropImage.clientWidth || cropImage.offsetWidth;
    displayedHeight = cropImage.clientHeight || cropImage.offsetHeight;

    const minDimension = Math.min(displayedWidth, displayedHeight);
    cropSize = Math.floor(Math.max(40, minDimension * 0.7));

    cropX = Math.floor((displayedWidth - cropSize) / 2);
    cropY = Math.floor((displayedHeight - cropSize) / 2);

    if (cropSizeSlider) {
      cropSizeSlider.min = "30";
      cropSizeSlider.max = String(Math.floor(minDimension));
      cropSizeSlider.value = String(cropSize);
    }

    renderCropBox();
  }

  function renderCropBox() {
    cropBox.style.left = `${cropX}px`;
    cropBox.style.top = `${cropY}px`;
    cropBox.style.width = `${cropSize}px`;
    cropBox.style.height = `${cropSize}px`;
  }

  function closeCropModal() {
    cropModal.classList.remove("active");
    avatarInput.value = "";
  }

  cropModalClose.addEventListener("click", closeCropModal);
  cropCancelBtn.addEventListener("click", closeCropModal);

  cropModal.addEventListener("click", (e) => {
    if (e.target === cropModal) {
      closeCropModal();
    }
  });

  // Slider resizing
  if (cropSizeSlider) {
    cropSizeSlider.addEventListener("input", (e) => {
      const newSize = parseFloat(e.target.value);
      const centerX = cropX + cropSize / 2;
      const centerY = cropY + cropSize / 2;

      cropSize = Math.min(newSize, Math.min(displayedWidth, displayedHeight));
      cropX = Math.min(Math.max(0, centerX - cropSize / 2), displayedWidth - cropSize);
      cropY = Math.min(Math.max(0, centerY - cropSize / 2), displayedHeight - cropSize);

      renderCropBox();
    });
  }

  // Pointer interactions for moving and resizing
  cropBox.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const handleEl = e.target.closest(".crop-handle");

    startPointerX = e.clientX;
    startPointerY = e.clientY;
    startCropX = cropX;
    startCropY = cropY;
    startCropSize = cropSize;

    if (handleEl) {
      isResizing = true;
      activeHandle = handleEl.dataset.handle;
      cropBox.setPointerCapture(e.pointerId);
    } else {
      isMoving = true;
      cropBox.setPointerCapture(e.pointerId);
    }
  });

  window.addEventListener("pointermove", (e) => {
    if (!isMoving && !isResizing) return;

    const deltaX = e.clientX - startPointerX;
    const deltaY = e.clientY - startPointerY;

    if (isMoving) {
      cropX = Math.min(Math.max(0, startCropX + deltaX), displayedWidth - cropSize);
      cropY = Math.min(Math.max(0, startCropY + deltaY), displayedHeight - cropSize);
      renderCropBox();
    } else if (isResizing) {
      let delta = 0;
      let newSize = startCropSize;
      let newX = startCropX;
      let newY = startCropY;

      if (activeHandle === "se") {
        delta = (deltaX + deltaY) / 2;
        newSize = Math.max(30, Math.min(startCropSize + delta, displayedWidth - startCropX, displayedHeight - startCropY));
      } else if (activeHandle === "sw") {
        delta = (-deltaX + deltaY) / 2;
        const maxSize = Math.min(startCropX + startCropSize, displayedHeight - startCropY);
        newSize = Math.max(30, Math.min(startCropSize + delta, maxSize));
        newX = startCropX + (startCropSize - newSize);
      } else if (activeHandle === "ne") {
        delta = (deltaX - deltaY) / 2;
        const maxSize = Math.min(displayedWidth - startCropX, startCropY + startCropSize);
        newSize = Math.max(30, Math.min(startCropSize + delta, maxSize));
        newY = startCropY + (startCropSize - newSize);
      } else if (activeHandle === "nw") {
        delta = (-deltaX - deltaY) / 2;
        const maxSize = Math.min(startCropX + startCropSize, startCropY + startCropSize);
        newSize = Math.max(30, Math.min(startCropSize + delta, maxSize));
        newX = startCropX + (startCropSize - newSize);
        newY = startCropY + (startCropSize - newSize);
      }

      cropSize = newSize;
      cropX = Math.max(0, Math.min(newX, displayedWidth - cropSize));
      cropY = Math.max(0, Math.min(newY, displayedHeight - cropSize));

      if (cropSizeSlider) {
        cropSizeSlider.value = String(cropSize);
      }

      renderCropBox();
    }
  });

  window.addEventListener("pointerup", () => {
    isMoving = false;
    isResizing = false;
    activeHandle = null;
  });

  // Apply Crop confirmation
  cropApplyBtn.addEventListener("click", () => {
    if (!displayedWidth || !displayedHeight || !naturalWidth) {
      closeCropModal();
      return;
    }

    const scale = naturalWidth / displayedWidth;
    const srcX = cropX * scale;
    const srcY = cropY * scale;
    const srcDim = cropSize * scale;

    const outputCanvas = document.createElement("canvas");
    const outputResolution = 256;
    outputCanvas.width = outputResolution;
    outputCanvas.height = outputResolution;
    const ctx = outputCanvas.getContext("2d");

    if (!ctx) {
      closeCropModal();
      return;
    }

    ctx.drawImage(
      cropImage,
      srcX,
      srcY,
      srcDim,
      srcDim,
      0,
      0,
      outputResolution,
      outputResolution
    );

    const croppedDataUrl = outputCanvas.toDataURL("image/png");

    // Update avatar UI preview immediately
    avatarPreview.innerHTML = `<img src="${croppedDataUrl}" alt="Profile Picture">`;

    // Also update navbar avatar
    const navAvatar = document.querySelector(".profile-avatar");
    if (navAvatar) {
      navAvatar.innerHTML = `<img src="${croppedDataUrl}" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    }

    // Prepare and submit native form to backend
    outputCanvas.toBlob((blob) => {
      if (!blob) {
        closeCropModal();
        showAvatarAlert("Failed to process cropped image.", "error");
        return;
      }

      if (avatarCroppedFile) {
        const file = new File([blob], "avatar.png", { type: "image/png" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        avatarCroppedFile.files = dataTransfer.files;
      }

      closeCropModal();

      if (avatarForm) {
        avatarForm.submit();
      }
    }, "image/png");
  });
});
