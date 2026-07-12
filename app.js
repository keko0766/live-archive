const DATA_PATH = "data.json";

const FILTERS = [
  { id: "all", label: "Барлығы" },
  { id: "IT", label: "IT" },
  { id: "Шығармашылық", label: "Шығармашылық" },
  { id: "Спорт", label: "Спорт" },
  { id: "Өмір", label: "Өмір" },
];

const state = {
  items: [],
  activeFilter: "all",
};

const elements = {
  homePage: document.querySelector("#top"),
  detailPage: document.querySelector("#detailPage"),
  grid: document.querySelector("#archiveGrid"),
  filters: document.querySelector("#filters"),
  emptyState: document.querySelector("#emptyState"),
  detailDate: document.querySelector("#detailDate"),
  detailMedia: document.querySelector("#detailMedia"),
  detailTags: document.querySelector("#detailTags"),
  detailTitle: document.querySelector("#detailTitle"),
  detailStory: document.querySelector("#detailStory"),
  detailTech: document.querySelector("#detailTech"),
  detailLinks: document.querySelector("#detailLinks"),
  metricTotal: document.querySelector("#metric-total"),
  metricCategories: document.querySelector("#metric-categories"),
  metricTools: document.querySelector("#metric-tools"),
  metricLinks: document.querySelector("#metric-links"),
};

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("hashchange", handleRoute);

async function init() {
  renderFilters();

  try {
    const response = await fetch(DATA_PATH);
    if (!response.ok) throw new Error(`Data request failed: ${response.status}`);
    const data = await response.json();
    state.items = normalizeItems(data).filter(isFilledItem);
  } catch (error) {
    console.error(error);
    state.items = [];
  }

  renderMetrics();
  renderArchive();
  handleRoute();
}

function normalizeItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function isFilledItem(item) {
  return Boolean(item?.id && item?.title && item?.date);
}

function renderFilters() {
  elements.filters.innerHTML = FILTERS.map((filter) => {
    const active = filter.id === state.activeFilter;
    return `
      <button
        class="${active ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-950 hover:text-zinc-950"} border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fafafa]"
        type="button"
        data-filter="${escapeAttribute(filter.id)}"
      >
        ${filter.label}
      </button>
    `;
  }).join("");

  elements.filters.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      renderFilters();
      renderArchive();
    });
  });
}

function renderMetrics() {
  const categories = new Set(state.items.map((item) => item.category).filter(Boolean));
  const tools = new Set(state.items.flatMap((item) => item.technologies ?? []).filter(Boolean));
  const links = state.items.reduce((total, item) => total + Object.keys(item.links ?? {}).length, 0);

  elements.metricTotal.textContent = state.items.length;
  elements.metricCategories.textContent = categories.size;
  elements.metricTools.textContent = tools.size;
  elements.metricLinks.textContent = links;
}

function renderArchive() {
  const visibleItems = getVisibleItems();
  elements.emptyState.classList.toggle("hidden", visibleItems.length > 0);

  elements.grid.innerHTML = visibleItems.map((item) => renderListItem(item)).join("");
}

function getVisibleItems() {
  if (state.activeFilter === "all") return state.items;
  return state.items.filter((item) => item.category === state.activeFilter);
}

function renderListItem(item) {
  const tags = renderTags(item.tags);
  const summary = item.shortDescription
    ? `<p class="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">${escapeHtml(item.shortDescription)}</p>`
    : "";

  return `
    <article class="border-b border-zinc-200 last:border-b-0">
      <a class="group grid gap-5 px-0 py-6 outline-none transition hover:bg-white focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-950 sm:grid-cols-[10rem_1fr_auto] sm:items-start sm:px-5" href="#entry/${escapeAttribute(encodeURIComponent(item.id))}">
        <div class="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
          <time>${escapeHtml(item.date)}</time>
          <p class="mt-2">${escapeHtml(item.category)}</p>
        </div>
        <div>
          <div class="mb-4 flex flex-wrap gap-2">${tags}</div>
          <h3 class="text-2xl font-semibold leading-tight tracking-normal text-zinc-950">${escapeHtml(item.title)}</h3>
          ${summary}
        </div>
        <span class="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 transition group-hover:text-zinc-950">ашу →</span>
      </a>
    </article>
  `;
}

function handleRoute() {
  const match = window.location.hash.match(/^#entry\/(.+)$/);
  if (!match) {
    showHomePage();
    return;
  }

  const id = decodeURIComponent(match[1]);
  const item = state.items.find((entry) => entry.id === id);

  if (!item) {
    showHomePage();
    return;
  }

  renderDetailPage(item);
}

function showHomePage() {
  elements.homePage.classList.remove("hidden");
  elements.detailPage.classList.add("hidden");
}

function renderDetailPage(item) {
  elements.homePage.classList.add("hidden");
  elements.detailPage.classList.remove("hidden");
  elements.detailDate.textContent = `${item.date} / ${item.category}`;
  elements.detailTags.innerHTML = renderTags(item.tags);
  elements.detailTitle.textContent = item.title;
  elements.detailStory.textContent = item.fullStory || item.shortDescription || "";
  elements.detailMedia.innerHTML = renderMedia(item.images);
  elements.detailTech.innerHTML = renderTags(item.technologies);
  elements.detailLinks.innerHTML = renderLinks(item.links);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderMedia(images = []) {
  if (!Array.isArray(images) || images.length === 0) return "";

  return `
    <div class="grid gap-4">
      ${images.map((image) => `
        <img
          class="aspect-[16/10] w-full border border-zinc-200 object-cover"
          src="${escapeAttribute(image)}"
          alt=""
          loading="lazy"
        />
      `).join("")}
    </div>
  `;
}

function renderTags(tags = []) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return `<span class="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">—</span>`;
  }

  return tags.map((tag) => `
    <span class="border border-zinc-200 bg-[#fafafa] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
      ${escapeHtml(tag)}
    </span>
  `).join("");
}

function renderLinks(links = {}) {
  const entries = Object.entries(links).filter(([, href]) => href);

  if (entries.length === 0) {
    return `<p class="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">—</p>`;
  }

  return entries.map(([label, href]) => `
    <a
      class="flex items-center justify-between border border-zinc-200 bg-white px-4 py-3 font-mono text-[11px] uppercase tracking-[0.13em] text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-4 focus-visible:ring-offset-[#fafafa]"
      href="${escapeAttribute(href)}"
      target="_blank"
      rel="noreferrer"
    >
      <span>${escapeHtml(label)}</span>
      <span>↗</span>
    </a>
  `).join("");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value = "") {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
