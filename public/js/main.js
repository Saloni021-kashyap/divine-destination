document.addEventListener("DOMContentLoaded", () => {
  initLegacySliders();
  initPasswordToggles();
  initNavbarMenu();
  initSeatInputGuard();
  initImagePreviews();
  initImageSlider();
});

function initLegacySliders() {
  document.querySelectorAll(".slider").forEach(slider => {
    const images = slider.querySelectorAll("img");
    const dots = slider.querySelectorAll(".dot");

    if (images.length <= 1) return;

    let index = 0;

    setInterval(() => {
      images[index].classList.remove("active");
      if (dots[index]) dots[index].classList.remove("active-dot");

      index = (index + 1) % images.length;

      images[index].classList.add("active");
      if (dots[index]) dots[index].classList.add("active-dot");
    }, 3000);
  });
}

function initPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach(toggle => {
    const togglePassword = () => {
      const targetId = toggle.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (!input) return;

      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      toggle.textContent = isHidden ? "Hide" : "Show";
      toggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
      toggle.setAttribute("aria-pressed", String(isHidden));
    };

    toggle.addEventListener("click", togglePassword);
    toggle.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePassword();
      }
    });
  });
}

function initNavbarMenu() {
  const menu = document.getElementById("navbarMenu");
  const navbar = document.querySelector(".navbar-divine");

  if (menu && window.bootstrap?.Collapse) {
    const bsCollapse = bootstrap.Collapse.getOrCreateInstance(menu, {
      toggle: false
    });

    menu.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 992 && menu.classList.contains("show")) {
          bsCollapse.hide();
        }
      });
    });
  }

  if (navbar) {
    const syncScrolledState = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    };

    syncScrolledState();
    window.addEventListener("scroll", syncScrolledState);
  }
}

function initSeatInputGuard() {
  const seatsInput = document.querySelector("input[name='seats']");
  if (!seatsInput) return;

  seatsInput.addEventListener("input", function () {
    const max = Number(this.max) || 100;
    if (Number(this.value) > max) {
      this.value = max;
    }
  });
}

function initImagePreviews() {
  document.querySelectorAll(".image-preview-input").forEach(input => {
    const previewTargetId = input.getAttribute("data-preview-target");
    const previewContainer = previewTargetId ? document.getElementById(previewTargetId) : null;
    if (!previewContainer) return;

    input.addEventListener("change", () => {
      previewContainer.innerHTML = "";

      Array.from(input.files || []).forEach((file, index) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = event => {
          const previewItem = document.createElement("div");
          previewItem.className = "image-preview-item";
          previewItem.innerHTML = `
            <img src="${event.target.result}" alt="Preview ${index + 1}">
          `;
          previewContainer.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
      });
    });
  });
}

function initImageSlider() {
  document.querySelectorAll("[data-image-slider]").forEach(slider => {
    const slides = Array.from(slider.querySelectorAll(".slide"));
    const indicators = Array.from(slider.querySelectorAll(".indicator"));
    const currentCounter = slider.querySelector("[data-current-slide]");

    if (slides.length <= 1) return;

    let currentIndex = 0;

    const renderSlide = nextIndex => {
      currentIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        slide.classList.toggle("active", index === currentIndex);
      });

      indicators.forEach((indicator, index) => {
        indicator.classList.toggle("active", index === currentIndex);
      });

      if (currentCounter) {
        currentCounter.textContent = String(currentIndex + 1);
      }
    };

    slider.querySelectorAll("[data-slide-dir]").forEach(button => {
      button.addEventListener("click", () => {
        const direction = Number(button.getAttribute("data-slide-dir")) || 0;
        renderSlide(currentIndex + direction);
      });
    });

    indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", () => renderSlide(index));
    });

    document.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") renderSlide(currentIndex - 1);
      if (event.key === "ArrowRight") renderSlide(currentIndex + 1);
    });
  });
}

function confirmDelete() {
  Swal.fire({
    title: "Delete Listing?",
    text: "You won't be able to recover this listing!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!"
  }).then(result => {
    if (result.isConfirmed) {
      document.getElementById("deleteForm")?.submit();
    }
  });
}
