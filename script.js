const menuToggle = document.querySelector("[data-menu-toggle]");
const navigation = document.querySelector("[data-nav]");
const navigationLinks = document.querySelectorAll(".main-nav a");
const pageSections = document.querySelectorAll("main section[id]");

menuToggle?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
  });
});

const updateActiveNavigation = () => {
  let currentSection = "";

  pageSections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 190) {
      currentSection = section.id;
    }
  });

  navigationLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${currentSection}`
    );
  });
};

window.addEventListener("scroll", updateActiveNavigation, { passive: true });
updateActiveNavigation();

document.querySelector("[data-year]").textContent = new Date().getFullYear();

const scrollTopButton = document.querySelector("[data-scroll-top]");

const updateScrollTopProgress = () => {
  if (!scrollTopButton) {
    return;
  }

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  scrollTopButton.style.setProperty("--scroll-progress", `${clampedProgress * 100}%`);
};

scrollTopButton?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

window.addEventListener("scroll", updateScrollTopProgress, { passive: true });
window.addEventListener("resize", updateScrollTopProgress);
updateScrollTopProgress();

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsContainer = carousel.querySelector("[data-carousel-dots]");
  const currentLabel = carousel.querySelector("[data-carousel-current]");
  let currentIndex = 0;
  let scrollFrame;
  let autoAdvanceTimer;
  const autoAdvanceDelay = 8000;

  const formatNumber = (number) => String(number).padStart(2, "0");

  const updateControls = (index) => {
    currentIndex = index;
    currentLabel.textContent = formatNumber(index + 1);

    dotsContainer.querySelectorAll("button").forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const pauseAutoAdvance = () => {
    window.clearTimeout(autoAdvanceTimer);
  };

  const scheduleAutoAdvance = () => {
    pauseAutoAdvance();

    if (slides.length <= 1) {
      return;
    }

    autoAdvanceTimer = window.setTimeout(() => {
      goToSlide(currentIndex + 1);
    }, autoAdvanceDelay);
  };

  const goToSlide = (index, behavior = "smooth") => {
    const targetIndex = (index + slides.length) % slides.length;
    track.scrollTo({
      left: track.clientWidth * targetIndex,
      behavior,
    });
    updateControls(targetIndex);
    scheduleAutoAdvance();
  };

  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show image ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  previousButton.addEventListener("click", () => goToSlide(currentIndex - 1));
  nextButton.addEventListener("click", () => goToSlide(currentIndex + 1));

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(currentIndex + 1);
    }
  });

  track.addEventListener(
    "scroll",
    () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        const index = Math.round(track.scrollLeft / track.clientWidth);
        updateControls(Math.max(0, Math.min(index, slides.length - 1)));
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", () => goToSlide(currentIndex, "auto"));
  updateControls(0);
  scheduleAutoAdvance();
});

const researchImageCards = document.querySelectorAll(".research-grid .card-art");
let activeZoomBackdrop = null;

const closeImageZoom = () => {
  activeZoomBackdrop?.remove();
  activeZoomBackdrop = null;
  document.body.classList.remove("image-zoom-open");
};

const openImageZoom = (image) => {
  if (activeZoomBackdrop) {
    closeImageZoom();
    return;
  }

  activeZoomBackdrop = document.createElement("div");
  activeZoomBackdrop.className = "image-zoom-backdrop";
  activeZoomBackdrop.setAttribute("role", "button");
  activeZoomBackdrop.setAttribute("tabindex", "0");
  activeZoomBackdrop.setAttribute("aria-label", "Close enlarged research image");

  const enlargedImage = document.createElement("img");
  enlargedImage.src = image.currentSrc || image.src;
  enlargedImage.alt = image.alt || "Enlarged research image";

  activeZoomBackdrop.appendChild(enlargedImage);
  document.body.appendChild(activeZoomBackdrop);
  document.body.classList.add("image-zoom-open");
  activeZoomBackdrop.focus();

  activeZoomBackdrop.addEventListener("click", closeImageZoom);
  activeZoomBackdrop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === "Escape") {
      event.preventDefault();
      closeImageZoom();
    }
  });
};

researchImageCards.forEach((card) => {
  const image = card.querySelector("img");

  if (!image) {
    return;
  }

  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", "Enlarge research image");

  card.addEventListener("click", () => openImageZoom(image));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openImageZoom(image);
    }
  });
});
