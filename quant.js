const QUANT_PORTFOLIO = window.PORTFOLIO_CONTENT || {};
const QUANT_PROFILE = QUANT_PORTFOLIO.profile || {};
const QUANT_PROJECTS = QUANT_PORTFOLIO.projects || [];
const QUANT_EXPERIENCE = QUANT_PORTFOLIO.experience || [];
const QUANT_CONTACT = QUANT_PORTFOLIO.contact || {};
const QUANT_SITE = QUANT_PORTFOLIO.quantSite || {};

const PRIMARY_CURVE = [18, 24, 22, 29, 33, 31, 38, 44, 41, 49, 54, 57];
const SECONDARY_CURVE = [11, 15, 13, 19, 21, 18, 25, 27, 24, 31, 29, 35];

function sparkline(values, variant = "") {
  const width = 320;
  const height = 96;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const xStep = width / (values.length - 1);
  const points = values
    .map((value, index) => {
      const scaled = max === min ? height / 2 : height - ((value - min) / (max - min)) * (height - 14) - 7;
      return `${index * xStep},${scaled}`;
    })
    .join(" ");

  return `
    <svg class="sparkline ${variant}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${points}" />
    </svg>
  `;
}

function renderNav() {
  const nav = document.getElementById("quantNavLinks");
  if (!nav) return;

  nav.innerHTML = (QUANT_SITE.navigation || [])
    .map((item) => `<a href="#${item.id}">${item.label}</a>`)
    .join("");
}

function renderHero() {
  const hero = QUANT_SITE.hero || {};
  return `
    <section class="quant-section quant-hero-section" id="overview">
      <div class="quant-hero-grid">
        <div class="quant-hero-copy quant-panel">
          <p class="quant-kicker">${hero.eyebrow || ""}</p>
          <h1>${hero.headline || ""}</h1>
          <p class="quant-summary">${hero.summary || ""}</p>
          <div class="quant-hero-actions">
            <a class="quant-button primary" href="${QUANT_PROFILE.github}" target="_blank" rel="noreferrer">GitHub</a>
            <a class="quant-button" href="${QUANT_PROFILE.resumeUrl}" target="_blank" rel="noreferrer">Resume</a>
            <a class="quant-button" href="index.html">Terminal / Main Site</a>
          </div>
          <div class="quant-notes">
            ${(hero.notes || []).map((note) => `<div class="note-row">${note}</div>`).join("")}
          </div>
        </div>

        <aside class="quant-desk quant-panel">
          <div class="desk-header">
            <div>
              <p class="quant-kicker">DESK SNAPSHOT</p>
              <h2>Current board</h2>
            </div>
            <span class="desk-status">LIVE RESEARCH</span>
          </div>
          <div class="metric-grid">
            ${(hero.metrics || [])
              .map(
                (metric) => `
                  <div class="metric-card">
                    <span class="metric-label">${metric.label}</span>
                    <strong>${metric.value}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="curve-card">
            <div class="curve-header">
              <span>Research momentum</span>
              <span>12-step view</span>
            </div>
            ${sparkline(PRIMARY_CURVE, "primary")}
            ${sparkline(SECONDARY_CURVE, "secondary")}
          </div>
        </aside>
      </div>

      <div class="ticker-shell">
        <div class="ticker-track">
          ${[...(hero.tape || []), ...(hero.tape || [])]
            .map((item, index) => `<span class="ticker-item">${String(index + 1).padStart(2, "0")} ${item}</span>`)
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderResearch() {
  return `
    <section class="quant-section" id="research">
      <div class="section-head">
        <p class="quant-kicker">RESEARCH STACK</p>
        <h2>How I want the work to look</h2>
      </div>
      <div class="research-grid">
        ${(QUANT_SITE.research || [])
          .map(
            (item) => `
              <article class="quant-panel research-card">
                <p class="quant-kicker">THESIS</p>
                <h3>${item.title}</h3>
                <p>${item.body}</p>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="board-grid">
        <div class="quant-panel process-panel">
          <p class="quant-kicker">PROCESS</p>
          <h3>Operating rules</h3>
          <ul class="process-list">
            ${(QUANT_SITE.process || []).map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
        <div class="quant-panel focus-board">
          <p class="quant-kicker">FOCUS BOARD</p>
          <h3>What is actually in motion</h3>
          <div class="focus-board-grid">
            ${(QUANT_SITE.focusBoard || [])
              .map(
                (item) => `
                  <div class="focus-board-row">
                    <span>${item.label}</span>
                    <strong>${item.value}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderProjects() {
  return `
    <section class="quant-section" id="projects">
      <div class="section-head">
        <p class="quant-kicker">TRADE BOOK</p>
        <h2>Projects under review</h2>
      </div>
      <div class="book-grid">
        ${QUANT_PROJECTS.map(
          (project, index) => `
            <article class="quant-panel book-card">
              <div class="book-card-header">
                <span class="book-index">${String(index + 1).padStart(2, "0")}</span>
                <span class="book-status ${project.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${project.status}</span>
              </div>
              <h3>${project.title}</h3>
              <p class="book-badge">${project.badge}</p>
              <p class="book-summary">${project.summary}</p>
              <ul class="book-bullets">
                ${(project.bullets || []).map((bullet) => `<li>${bullet}</li>`).join("")}
              </ul>
              <div class="book-tags">
                ${(project.tech || []).map((item) => `<span>${item}</span>`).join("")}
              </div>
              <div class="book-actions">
                <a class="quant-button primary" href="${project.link}" target="_blank" rel="noreferrer">Repository</a>
              </div>
            </article>
          `
        ).join("")}
      </div>
    </section>
  `;
}

function renderExperience() {
  return `
    <section class="quant-section" id="experience">
      <div class="section-head">
        <p class="quant-kicker">TRACK RECORD</p>
        <h2>Experience ledger</h2>
      </div>
      <div class="ledger-table quant-panel">
        <div class="ledger-head ledger-row">
          <span>Period</span>
          <span>Role</span>
          <span>Signal</span>
        </div>
        ${QUANT_EXPERIENCE.map(
          (item) => `
            <div class="ledger-row">
              <span class="ledger-period">${item.dates}</span>
              <div>
                <strong>${item.title}</strong>
                <p>${item.company} • ${item.location}</p>
              </div>
              <div class="ledger-signal">
                <p>${item.summary}</p>
                <div class="ledger-tags">${(item.tech || []).map((tech) => `<span>${tech}</span>`).join("")}</div>
              </div>
            </div>
          `
        ).join("")}
      </div>
    </section>
  `;
}

function renderContact() {
  return `
    <section class="quant-section" id="contact">
      <div class="section-head">
        <p class="quant-kicker">CONTACT</p>
        <h2>Open channel</h2>
        <p class="section-copy">${QUANT_SITE.contactLine || ""}</p>
      </div>
      <div class="contact-grid">
        ${(QUANT_CONTACT.methods || [])
          .map(
            (item) => `
              <article class="quant-panel contact-card">
                <p class="quant-kicker">CHANNEL</p>
                <h3>${item.label}</h3>
                <a href="${item.href}" ${item.href.startsWith("mailto:") ? "" : 'target="_blank" rel="noreferrer"'}>${item.value}</a>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderQuantSite() {
  const app = document.getElementById("quantApp");
  if (!app) return;

  app.innerHTML = `
    ${renderHero()}
    ${renderResearch()}
    ${renderProjects()}
    ${renderExperience()}
    ${renderContact()}
  `;
}

function applyQuantMeta() {
  if (QUANT_SITE.title) document.title = QUANT_SITE.title;
  const description = document.querySelector('meta[name="description"]');
  if (description && QUANT_SITE.description) description.setAttribute("content", QUANT_SITE.description);
}

function startClock() {
  const clock = document.getElementById("quantClock");
  if (!clock) return;

  const update = () => {
    clock.textContent = new Date().toTimeString().split(" ")[0];
  };

  update();
  setInterval(update, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  applyQuantMeta();
  renderNav();
  renderQuantSite();
  startClock();
});
