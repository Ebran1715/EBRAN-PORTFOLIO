export function initInteractions() {
  // Page identifiers list
  const pages = ["home", "experience", "monitoring", "skills", "projects", "education", "contact"];
  let currentPageIndex = 0;
  let isPagedMode = document.body.classList.contains("mode-paged");
  let requestedPageId = null;

  // Toast notification helper
  const toastEl = document.querySelector("#toast");
  let toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
    }, 2800);
  }

  function updateNavigation(targetId) {
    currentPageIndex = pages.indexOf(targetId);

    document.querySelectorAll(".nav-link, .mobile-link").forEach((link) => {
      const linkTarget = link.dataset.navTarget || link.getAttribute("href")?.replace("#", "");
      link.classList.toggle("active", linkTarget === targetId);
    });

    document.querySelectorAll(".step-dots").forEach((dotsContainer) => {
      dotsContainer.querySelectorAll(".dot").forEach((dot, dotIdx) => {
        dot.classList.toggle("active", dotIdx === currentPageIndex);
      });
    });
  }

  function observeScrollPages() {
    if (typeof IntersectionObserver === "undefined") return;

    const pageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("scroll-visible");
        }
      });

      const viewportMiddle = window.innerHeight * 0.45;
      const sections = [...document.querySelectorAll(".page-view")];
      const visiblePage = sections.find((section) => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= viewportMiddle && bounds.bottom >= viewportMiddle;
      }) || sections
        .filter((section) => section.getBoundingClientRect().top <= viewportMiddle)
        .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0];

      if (requestedPageId && visiblePage?.id === requestedPageId) {
        requestedPageId = null;
      }

      if (visiblePage && !requestedPageId && visiblePage.id !== pages[currentPageIndex]) {
        updateNavigation(visiblePage.id);
        try {
          history.replaceState(null, "", `#${visiblePage.id}`);
        } catch (e) {
          // Ignore in restricted iframe contexts
        }
      }
    }, { threshold: 0.18 });

    document.querySelectorAll(".page-view").forEach((section) => pageObserver.observe(section));
  }

  // Copy to clipboard
  document.querySelectorAll(".btn-copy-sm").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const text = btn.dataset.copy;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast(`Copied: ${text}`);
      } catch (err) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showToast(`Copied: ${text}`);
      }
    });
  });

  const photoImage = document.querySelector(".photo-img");
  const photoTrigger = document.querySelector(".photo-trigger");
  const photoLightbox = document.querySelector("#photo-lightbox");
  const photoLightboxImage = document.querySelector("#photo-lightbox-image");
  const photoLightboxClose = document.querySelector("#photo-lightbox-close");

  if (photoImage) {
    const revealPhoto = () => photoImage.classList.add("is-loaded");
    if (photoImage.complete) revealPhoto();
    else photoImage.addEventListener("load", revealPhoto, { once: true });
  }

  function closePhotoLightbox() {
    if (!photoLightbox) return;
    photoLightbox.classList.remove("open");
    photoLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    window.setTimeout(() => {
      photoLightbox.hidden = true;
    }, 220);
  }

  function openPhotoLightbox() {
    if (!photoTrigger || !photoLightbox || !photoLightboxImage) return;
    photoLightboxImage.src = photoImage.src;
    photoLightboxImage.alt = photoImage.alt;
    photoLightbox.hidden = false;
    photoLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    window.requestAnimationFrame(() => photoLightbox.classList.add("open"));
  }

  if (photoTrigger && photoLightbox && photoLightboxImage) {
    photoTrigger.addEventListener("click", openPhotoLightbox);
    photoLightbox.addEventListener("click", (event) => {
      if (event.target === photoLightbox) closePhotoLightbox();
    });
    photoLightboxClose?.addEventListener("click", closePhotoLightbox);
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !photoLightbox.hidden) closePhotoLightbox();
    });
  }

  document.querySelectorAll(".hero-actions .btn-next-page").forEach((btn) => {
    btn.addEventListener("click", () => goToPage(btn.dataset.nextTarget || "experience"));
  });

  // Dynamic Page Switcher Engine
  function goToPage(target, smooth = true) {
    let index = -1;
    let targetId = "";

    if (typeof target === "number") {
      index = Math.max(0, Math.min(pages.length - 1, target));
      targetId = pages[index];
    } else if (typeof target === "string") {
      const cleanId = target.replace(/^#/, "");
      index = pages.indexOf(cleanId);
      targetId = index !== -1 ? cleanId : pages[0];
      if (index === -1) index = 0;
    }

    currentPageIndex = index;
    requestedPageId = targetId;

    if (isPagedMode) {
      // Hide all pages, display active page with animation
      document.querySelectorAll(".page-view").forEach((section) => {
        section.classList.remove("active");
      });

      const activeSection = document.getElementById(targetId);
      if (activeSection) {
        activeSection.classList.add("active");
      }

      // Smooth scroll to top of view
      window.scrollTo({
        top: 0,
        behavior: smooth ? "smooth" : "auto"
      });
    } else {
      // Continuous scroll mode: scroll to section
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
      }
    }

    updateNavigation(targetId);

    // Update URL hash quietly
    try {
      history.replaceState(null, "", `#${targetId}`);
    } catch (e) {
      // Ignore in restricted iframe contexts
    }
  }

  // Top nav and mobile menu links
  document.querySelectorAll(".nav-link, .mobile-link, .brand").forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = link.dataset.navTarget || link.getAttribute("href")?.replace("#", "");
      if (target && pages.includes(target)) {
        e.preventDefault();
        goToPage(target);

        // Close mobile drawer if open
        const mobileMenu = document.querySelector("#mobile-menu");
        const mobileToggle = document.querySelector("#mobile-toggle");
        if (mobileMenu && mobileMenu.classList.contains("open")) {
          mobileMenu.classList.remove("open");
          mobileToggle?.setAttribute("aria-expanded", "false");
          mobileMenu.setAttribute("aria-hidden", "true");
        }
      }
    });
  });

  // Keyboard navigation: ArrowRight -> Next, ArrowLeft -> Prev
  window.addEventListener("keydown", (e) => {
    // Only navigate if user is not typing in a text field
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
    if (activeTag === "input" || activeTag === "textarea") return;

    if (e.key === "ArrowRight") {
      if (currentPageIndex < pages.length - 1) {
        goToPage(currentPageIndex + 1);
      }
    } else if (e.key === "ArrowLeft") {
      if (currentPageIndex > 0) {
        goToPage(currentPageIndex - 1);
      }
    }
  });

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector("#mobile-toggle");
  const mobileMenu = document.querySelector("#mobile-menu");
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", String(isOpen));
      mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    });
  }

  // Skills Tab Filtering & Live Search
  const skillTabs = document.querySelectorAll(".skill-tab-btn");
  const skillCards = document.querySelectorAll(".skill-card");
  const skillSearch = document.querySelector("#skill-search");

  function filterSkills() {
    const activeTab = document.querySelector(".skill-tab-btn.active");
    const category = activeTab ? activeTab.dataset.category : "all";
    const query = skillSearch ? skillSearch.value.toLowerCase().trim() : "";

    skillCards.forEach((card) => {
      const domain = card.dataset.domain;
      const pills = card.querySelectorAll(".pill");
      let matchesCategory = category === "all" || domain === category;
      let matchesSearch = false;

      if (!query) {
        matchesSearch = true;
        pills.forEach((p) => (p.style.display = ""));
      } else {
        let matchingPillsCount = 0;
        pills.forEach((pill) => {
          const text = pill.textContent.toLowerCase();
          if (text.includes(query)) {
            pill.style.display = "";
            matchingPillsCount++;
          } else {
            pill.style.display = "none";
          }
        });
        const cardHeader = card.querySelector("h3").textContent.toLowerCase();
        matchesSearch = matchingPillsCount > 0 || cardHeader.includes(query);
      }

      if (matchesCategory && matchesSearch) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }

  skillTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      skillTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      filterSkills();
    });
  });

  if (skillSearch) {
    skillSearch.addEventListener("input", filterSkills);
  }

  // Projects Category Filter
  const projTabs = document.querySelectorAll(".proj-tab");
  const projItems = document.querySelectorAll(".project-item");

  projTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      projTabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;

      projItems.forEach((item) => {
        const cat = item.dataset.category;
        if (filter === "all" || cat === filter) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // Check initial URL hash on page load
  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && pages.includes(initialHash)) {
    goToPage(initialHash, false);
  } else {
    goToPage(0, false);
  }

  observeScrollPages();
}
