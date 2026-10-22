"use strict";

const jobCards = Array.from(document.querySelectorAll(".job-card"));
const searchForm = document.querySelector("#job-search");
const keywordInput = document.querySelector("#keyword");
const locationInput = document.querySelector("#location");
const jobGrid = document.querySelector("#job-grid");
const emptyState = document.querySelector("#empty-state");
const jobCount = document.querySelector("#job-count");
const resultsMessage = document.querySelector("#results-message");
const sortSelect = document.querySelector("#sort-jobs");
const toast = document.querySelector("#toast");
const applyDialog = document.querySelector("#apply-dialog");
const applyRole = document.querySelector("#apply-role");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
let activeTab = "all";
let toastTimeout;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 3200);
}

function matchesTab(card) {
  if (activeTab === "all") return true;
  if (activeTab === "remote") return card.dataset.remote === "true";
  if (activeTab === "sustainability") return card.dataset.title.toLowerCase().includes("sustainability");
  return card.dataset.category === activeTab;
}

function filterJobs() {
  const keyword = keywordInput.value.trim().toLowerCase();
  const location = locationInput.value.trim().toLowerCase();
  let visibleCount = 0;

  jobCards.forEach((card) => {
    const searchableText = `${card.dataset.title} ${card.dataset.company} ${card.dataset.category} ${card.dataset.location}`.toLowerCase();
    const visible = matchesTab(card) && (!keyword || searchableText.includes(keyword)) && (!location || card.dataset.location.toLowerCase().includes(location));
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
  jobGrid.hidden = visibleCount === 0;
  jobCount.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "thoughtful opportunity" : "thoughtful opportunities"}`;
  resultsMessage.textContent = keyword || location
    ? `${visibleCount} ${visibleCount === 1 ? "role" : "roles"} match your search${keyword ? ` for “${keywordInput.value.trim()}”` : ""}${location ? ` near “${locationInput.value.trim()}”` : ""}.`
    : "";
}

function sortJobs() {
  const sortBy = sortSelect.value;
  const sorted = [...jobCards].sort((first, second) => {
    if (sortBy === "newest") return Number(first.dataset.age) - Number(second.dataset.age);
    if (sortBy === "salary") return Number(second.dataset.salary) - Number(first.dataset.salary);
    return jobCards.indexOf(first) - jobCards.indexOf(second);
  });
  sorted.forEach((card) => jobGrid.append(card));
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  activeTab = "all";
  document.querySelectorAll(".job-tab").forEach((tab) => {
    const selected = tab.dataset.filter === "all";
    tab.classList.toggle("selected", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  filterJobs();
  document.querySelector("#opportunities").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll("[data-search-term]").forEach((button) => {
  button.addEventListener("click", () => {
    const term = button.dataset.searchTerm;
    if (term === "Remote") {
      keywordInput.value = "";
      locationInput.value = "Remote";
    } else {
      keywordInput.value = term;
      locationInput.value = "";
    }
    searchForm.requestSubmit();
  });
});

document.querySelectorAll(".job-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    activeTab = tab.dataset.filter;
    keywordInput.value = "";
    locationInput.value = "";
    document.querySelectorAll(".job-tab").forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-selected", String(selected));
    });
    filterJobs();
  });
});

sortSelect.addEventListener("change", sortJobs);
document.querySelector("#clear-search").addEventListener("click", () => {
  keywordInput.value = "";
  locationInput.value = "";
  activeTab = "all";
  sortSelect.value = "recommended";
  sortJobs();
  document.querySelector('.job-tab[data-filter="all"]').click();
});

document.querySelectorAll(".save-button").forEach((button) => {
  button.addEventListener("click", () => {
    const saved = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(saved));
    showToast(saved ? "Saved to your shortlist." : "Removed from your shortlist.");
  });
});

document.querySelectorAll("[data-apply]").forEach((button) => {
  button.addEventListener("click", () => {
    applyRole.textContent = button.dataset.apply;
    applyDialog.showModal();
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => applyDialog.close());
applyDialog.addEventListener("click", (event) => {
  if (event.target === applyDialog) applyDialog.close();
});
document.querySelector("#apply-form").addEventListener("submit", (event) => {
  event.preventDefault();
  applyDialog.close();
  event.currentTarget.reset();
  showToast("Your interest is noted in this preview. No information was sent.");
});

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast("Thanks for your interest. Newsletter signup is not connected yet.");
});

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

document.querySelectorAll("[data-category-search]").forEach((button) => {
  button.addEventListener("click", () => {
    activeTab = button.dataset.categorySearch;
    keywordInput.value = "";
    locationInput.value = "";
    document.querySelectorAll(".job-tab").forEach((tab) => {
      const selected = tab.dataset.filter === activeTab;
      tab.classList.toggle("selected", selected);
      tab.setAttribute("aria-selected", String(selected));
    });
    filterJobs();
    document.querySelector("#opportunities").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  primaryNav.classList.toggle("open", !isExpanded);
});

primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    primaryNav.classList.remove("open");
  });
});

const heroVisual = document.querySelector(".hero-visual");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!reducedMotion.matches && window.matchMedia("(pointer: fine)").matches) {
  heroVisual.addEventListener("pointermove", (event) => {
    const bounds = heroVisual.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
    heroVisual.style.setProperty("--globe-x", `${x}px`);
    heroVisual.style.setProperty("--globe-y", `${y}px`);
  });
  heroVisual.addEventListener("pointerleave", () => {
    heroVisual.style.setProperty("--globe-x", "0px");
    heroVisual.style.setProperty("--globe-y", "0px");
  });
}

filterJobs();
