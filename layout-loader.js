(() => {
  const NAV_CONTAINER_ID = "site-nav";
  const FOOTER_CONTAINER_ID = "site-footer";
  const SHARED_STYLES_ID = "shared-layout-styles";
  const SHARED_STYLESHEET_FILE = "layout-shared.css";
  const CONSULT_MODAL_ID = "consultation-modal";
  const STORAGE_KEY = "tlfta_inquiries";

  const fragmentTargets = [
    { id: NAV_CONTAINER_ID, file: "nav.html" },
    { id: FOOTER_CONTAINER_ID, file: "footer.html" },
  ];

  const ensureSharedStyles = () => {
    if (document.getElementById(SHARED_STYLES_ID)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const link = document.createElement("link");
      link.id = SHARED_STYLES_ID;
      link.rel = "stylesheet";
      link.href = SHARED_STYLESHEET_FILE;
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
  };

  const detectPageKey = () => {
    const fileName = window.location.pathname.split("/").pop() || "index.html";

    if (fileName === "index.html" || fileName === "") {
      return "home";
    }

    if (fileName === "about-us.html") {
      return "firm";
    }

    if (fileName === "careers.html") {
      return "careers";
    }

    if (fileName === "blog.html" || fileName === "blog-detail.html") {
      return "blog";
    }

    if (
      fileName === "family-law.html" ||
      fileName === "labor-law.html" ||
      fileName === "corporate-law.html" ||
      fileName === "cybercrime-law.html" ||
      fileName === "environmental-law.html"
    ) {
      return "work";
    }

    if (fileName === "privacy-policy.html") {
      return "privacy";
    }

    if (fileName === "terms-of-use.html") {
      return "terms";
    }

    if (fileName === "accessibility.html") {
      return "accessibility";
    }

    return "";
  };

  const setCurrentLinkState = () => {
    const pageKey = detectPageKey();
    if (!pageKey) {
      return;
    }

    const selectors = [
      `[data-nav-key=\"${pageKey}\"]`,
      `[data-footer-key=\"${pageKey}\"]`,
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((link) => {
        link.setAttribute("aria-current", "page");
      });
    });
  };

  const CONSULT_MODAL_MARKUP = `
    <section
      id="consultation-modal"
      class="consult-modal-backdrop"
      aria-hidden="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-modal-title"
    >
      <div class="consult-modal">
        <div class="consult-modal-head">
          <div>
            <h2 id="consultation-modal-title">Contact Our Team</h2>
            <p>Complete the form below and we will follow up with your consultation request.</p>
          </div>
          <button type="button" id="consultation-modal-close" class="consult-modal-close" aria-label="Close consultation form">
            &times;
          </button>
        </div>
        <form id="consultation-modal-form" class="consult-modal-form">
          <div class="consult-modal-grid">
            <label class="field">
              Name
              <input type="text" name="name" placeholder="Your full name" required />
            </label>
            <label class="field">
              Email
              <input type="email" name="email" placeholder="name@example.com" required />
            </label>
            <label class="field">
              Phone Number
              <input type="tel" name="phone" placeholder="+63 9xx xxx xxxx" required />
            </label>
            <label class="field">
              Location
              <input type="text" name="location" placeholder="City/Province" required />
            </label>
            <label class="field full">
              I would like to talk to you about...
              <textarea name="message" placeholder="Tell us briefly about your legal concern." required></textarea>
            </label>
          </div>
          <div class="consult-modal-actions">
            <button class="submit" type="submit">Send</button>
          </div>
          <p id="consultation-modal-message" class="form-message" aria-live="polite"></p>
        </form>
      </div>
    </section>
  `;

  const ensureConsultModal = () => {
    let modal = document.getElementById(CONSULT_MODAL_ID);
    if (modal) {
      return modal;
    }

    document.body.insertAdjacentHTML("beforeend", CONSULT_MODAL_MARKUP);
    modal = document.getElementById(CONSULT_MODAL_ID);
    return modal;
  };

  const setMessage = (messageEl, message, type) => {
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.className = type ? `form-message ${type}` : "form-message";
  };

  const normalizeInquiryValue = (value) => String(value || "").trim().toLowerCase();
  const buildInquirySignature = (inquiry) =>
    [
      normalizeInquiryValue(inquiry.name),
      normalizeInquiryValue(inquiry.email),
      normalizeInquiryValue(inquiry.phone),
      normalizeInquiryValue(inquiry.location),
      normalizeInquiryValue(inquiry.workplace),
      normalizeInquiryValue(inquiry.partyType),
      normalizeInquiryValue(inquiry.message),
    ].join("|");

  const appendInquiryIfNew = (inquiry) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const inquiries = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(inquiries) ? inquiries : [];
    const latest = list[0];

    if (latest) {
      const samePayload = buildInquirySignature(latest) === buildInquirySignature(inquiry);
      const latestTime = Date.parse(String(latest.createdAt || ""));
      const currentTime = Date.parse(String(inquiry.createdAt || ""));
      const withinDuplicateWindow =
        Number.isFinite(latestTime) &&
        Number.isFinite(currentTime) &&
        Math.abs(currentTime - latestTime) <= 10000;

      if (samePayload && withinDuplicateWindow) {
        return false;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify([inquiry, ...list]));
    return true;
  };

  const bindConsultModal = () => {
    if (document.body.dataset.consultModalBound === "1") {
      return;
    }

    if (document.getElementById("inquiry-form")) {
      document.body.dataset.consultModalBound = "1";
      return;
    }

    const modal = ensureConsultModal();
    if (!modal) {
      return;
    }

    const closeButton = modal.querySelector("#consultation-modal-close");
    const form = modal.querySelector("#consultation-modal-form");
    const messageEl = modal.querySelector("#consultation-modal-message");
    const firstField = modal.querySelector("input[name='name']");
    let lastFocusedElement = null;

    const openModal = () => {
      lastFocusedElement = document.activeElement;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
      firstField?.focus();
    };

    const closeModal = () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
      }
    };

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-open-consult-modal]");
      if (!trigger) return;
      event.preventDefault();
      openModal();
    });

    closeButton?.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("open")) {
        closeModal();
      }
    });

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      setMessage(messageEl, "", "");

      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phone = String(formData.get("phone") || "").trim();
      const location = String(formData.get("location") || "").trim();
      const message = String(formData.get("message") || "").trim();

      if (!name || !email || !phone || !location || !message) {
        setMessage(messageEl, "Please complete all fields before submitting.", "error");
        return;
      }

      const inquiry = {
        id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        name,
        email,
        phone,
        location,
        message,
      };

      try {
        appendInquiryIfNew(inquiry);
        form.reset();
        setMessage(messageEl, "Sent successfully. Your consultation request has been received.", "success");
      } catch (error) {
        setMessage(messageEl, "Unable to submit right now. Please try again.", "error");
      }
    });

    const url = new URL(window.location.href);
    if (url.searchParams.get("consult") === "1") {
      openModal();
      url.searchParams.delete("consult");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }

    document.body.dataset.consultModalBound = "1";
  };

  const applyInquiryCtaStyles = () => {
    const selector = [
      "a[data-open-consult-modal]",
      "a.btn[href*='consult=1#contact']",
      "a.btn-outline[href*='consult=1#contact']",
      "a.cta-btn[href*='consult=1#contact']",
      "a.practice-snap-cta",
      "a.contact-cta-btn",
    ].join(", ");

    document.querySelectorAll(selector).forEach((link) => {
      if (link.closest("#site-footer")) {
        return;
      }
      if (String(link.getAttribute("href") || "").includes("consult=1#contact")) {
        link.setAttribute("data-open-consult-modal", "");
      }
      if (link.dataset.ctaStyle === "native") {
        return;
      }
      link.classList.add("inquiry-cta-btn");
    });

    document.querySelectorAll("a[href*='consult=1#contact']").forEach((link) => {
      link.setAttribute("data-open-consult-modal", "");
    });
  };

  const loadFragment = async ({ id, file }) => {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    try {
      const response = await fetch(file, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Unable to load ${file}: ${response.status}`);
      }

      target.innerHTML = await response.text();
    } catch (error) {
      console.error(error);
    }
  };

  const loadLayout = async () => {
    await ensureSharedStyles();
    await Promise.all(fragmentTargets.map(loadFragment));
    setCurrentLinkState();
    applyInquiryCtaStyles();
    bindConsultModal();
    document.dispatchEvent(new CustomEvent("layout:loaded"));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadLayout, { once: true });
  } else {
    loadLayout();
  }
})();
