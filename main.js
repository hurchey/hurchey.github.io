const PORTFOLIO = window.PORTFOLIO_CONTENT || {};
const META = PORTFOLIO.meta || {};
const PROFILE = PORTFOLIO.profile || {};
const HERO = PORTFOLIO.hero || {};
const NOW = PORTFOLIO.now || {};
const ABOUT = PORTFOLIO.about || {};
const SKILLS = PORTFOLIO.skills || [];
const PROJECTS = PORTFOLIO.projects || [];
const EXPERIENCE = PORTFOLIO.experience || [];
const CONTACT = PORTFOLIO.contact || {};
const QUICK_COMMANDS = PORTFOLIO.quickCommands || [];
const NAVIGATION = PORTFOLIO.navigation || [];
const TERMINAL = PORTFOLIO.terminal || {};

let currentMode = "gui";
let terminalSystem = null;
let quickCommandsVisible = false;
let firstVisit = !localStorage.getItem("portfolioVisited");
let scene3d = null;
let camera3d = null;
let renderer3d = null;
let shapes3d = [];
let animationId3d = null;

applyMeta();

if (firstVisit) localStorage.setItem("portfolioVisited", "true");

function applyMeta() {
  if (META.pageTitle) document.title = META.pageTitle;

  const description = document.querySelector('meta[name="description"]');
  if (description && META.description) description.setAttribute("content", META.description);

  const title = document.getElementById("terminalSystemTitle");
  if (title && META.terminalTitle) title.textContent = META.terminalTitle;

  const helpHint = document.getElementById("terminalHelpHint");
  if (helpHint && TERMINAL.promptHint) helpHint.textContent = TERMINAL.promptHint;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatFileContent(text) {
  const escaped = escapeHtml(text);
  const linkified = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a class="terminal-link" href="$1" target="_blank" rel="noreferrer">$1</a>'
  );
  return linkified.replace(/\n/g, "<br>");
}

function buildTerminalBanner(lines) {
  const contentWidth = Math.max(...lines.map((line) => line.length));
  const top = `╔${"═".repeat(contentWidth + 2)}╗`;
  const middle = lines.map((line) => `║ ${line.padEnd(contentWidth, " ")} ║`);
  const bottom = `╚${"═".repeat(contentWidth + 2)}╝`;
  return [top, ...middle, bottom].join("\n");
}

function renderSectionHeader(kicker, title, intro) {
  return `
    <div class="section-header">
      <p class="section-kicker">${kicker}</p>
      <h2 class="gui-section-title">${title}</h2>
      <p class="section-intro">${intro}</p>
    </div>
  `;
}

function renderActionButtons(buttons) {
  return buttons
    .map((button) => {
      const variantClass = button.primary ? "primary" : "";

      if (button.type === "section") {
        return `<button class="gui-button ${variantClass}" onclick="showGuiSection('${button.target}')">${button.label}</button>`;
      }

      if (button.type === "mode") {
        return `<button class="gui-button ${variantClass}" onclick="setMode('${button.target}')">${button.label}</button>`;
      }

      if (button.type === "external") {
        const isInternalPage = /\.html$/i.test(button.target);
        const targetAttrs = isInternalPage ? "" : ' target="_blank" rel="noreferrer"';
        return `<a class="gui-button ${variantClass}" href="${button.target}"${targetAttrs}>${button.label}</a>`;
      }

      return "";
    })
    .join("");
}

function renderNav() {
  const navMenu = document.getElementById("guiNavMenu");
  if (!navMenu) return;

  navMenu.innerHTML = NAVIGATION.map((item) => {
    const activeClass = item.id === "home" ? "active" : "";
    return `
      <li>
        <button class="gui-nav-link ${activeClass}" data-section="${item.id}" onclick="showGuiSection('${item.id}')">
          ${item.label}
        </button>
      </li>
    `;
  }).join("");
}

function renderQuickCommands() {
  const container = document.getElementById("quickCommandsContainer");
  if (!container) return;

  container.innerHTML = "";

  QUICK_COMMANDS.forEach((section) => {
    const sectionNode = document.createElement("div");
    sectionNode.className = "quick-cmd-section";

    const label = document.createElement("span");
    label.className = "quick-cmd-label";
    label.textContent = section.label;
    sectionNode.appendChild(label);

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "quick-cmd-buttons";

    section.items.forEach((item) => {
      const button = document.createElement("button");
      button.className = "quick-cmd-btn";
      button.type = "button";
      button.textContent = item.label;
      button.dataset.command = item.command;
      button.addEventListener("click", () => executeQuickCommand(item.command));
      buttonGroup.appendChild(button);
    });

    sectionNode.appendChild(buttonGroup);
    container.appendChild(sectionNode);
  });
}

function renderGuiHome() {
  const section = document.getElementById("gui-home");
  if (!section) return;

  const stats = (HERO.stats || [])
    .map(
      (stat) => `
        <div class="gui-stat-item">
          <span class="gui-stat-number">${stat.value}</span>
          <span class="gui-stat-label">${stat.label}</span>
        </div>
      `
    )
    .join("");

  const currentRole = EXPERIENCE[0];
  const currentProject = PROJECTS.find((project) => project.title === "QuantPilot") || PROJECTS[0];
  const compactSignals = [
    currentRole ? `Current role: ${currentRole.title} at ${currentRole.company}` : "",
    currentProject ? `Current build: ${currentProject.title}` : "",
    `Location: ${PROFILE.location}`
  ].filter(Boolean);

  const signalLinks = (HERO.signal?.links || [])
    .map(
      (link) => `<a class="signal-link" href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`
    )
    .join("");

  section.innerHTML = `
    <div class="gui-shell gui-home-shell">
      <section class="gui-hero">
        <div class="gui-hero-grid">
          <div class="gui-hero-copy">
            <h1>${PROFILE.name}</h1>
            <p class="gui-hero-subtitle">${PROFILE.role}</p>
            <p class="gui-hero-summary">
              Currently a Software Engineer Intern at GAIN and actively building QuantPilot around backtesting and strategy research.
            </p>
            <div class="gui-hero-buttons">${renderActionButtons(HERO.buttons || [])}</div>
            <div class="gui-stats-row">${stats}</div>
          </div>

          <aside class="gui-signal-card">
            <p class="signal-label">CURRENT SIGNAL</p>
            <h2>In motion now</h2>
            <ul class="signal-list">${compactSignals.map((point) => `<li>${point}</li>`).join("")}</ul>
            <div class="signal-links">${signalLinks}</div>
          </aside>
        </div>
      </section>
    </div>
  `;
}

function renderStandardSection(targetId, kicker, title, intro, bodyHtml) {
  const section = document.getElementById(targetId);
  if (!section) return;

  section.innerHTML = `
    <div class="gui-shell">
      <button class="gui-nav-back" onclick="showGuiSection('home')">Back to Home</button>
      ${renderSectionHeader(kicker, title, intro)}
      ${bodyHtml}
    </div>
  `;
}

function renderGuiNow() {
  const cards = (NOW.cards || [])
    .map(
      (card) => `
        <article class="gui-card now-card">
          <p class="card-kicker">${card.eyebrow}</p>
          <h3>${card.title}</h3>
          <p>${card.body}</p>
          <ul class="card-list">${(card.list || []).map((item) => `<li>${item}</li>`).join("")}</ul>
          ${
            card.link
              ? `<a class="inline-link" href="${card.link.url}" target="_blank" rel="noreferrer">${card.link.label}</a>`
              : ""
          }
        </article>
      `
    )
    .join("");

  const focusList = (NOW.focus || []).map((item) => `<li>${item}</li>`).join("");

  renderStandardSection(
    "gui-now",
    "CURRENT",
    "Current",
    NOW.intro,
    `<div class="gui-grid now-grid">${cards}</div>`
  );
}

function renderGuiAbout() {
  const cards = (ABOUT.cards || [])
    .map(
      (card) => `
        <article class="gui-card">
          <h3>${card.title}</h3>
          <p>${card.body}</p>
        </article>
      `
    )
    .join("");

  const values = (ABOUT.values || [])
    .map(
      (value) => `
        <div class="value-item">
          <h4>${value.title}</h4>
          <p>${value.body}</p>
        </div>
      `
    )
    .join("");

  const interests = (ABOUT.interests || []).map((item) => `<li>${item}</li>`).join("");

  renderStandardSection(
    "gui-about",
    "ABOUT",
    "About",
    ABOUT.intro,
    `
      <div class="gui-grid">${cards}</div>
      <div class="gui-values-section">
        <h3>What tends to drive my work</h3>
        <div class="gui-values-grid">${values}</div>
      </div>
      <div class="gui-interests">
        <p class="card-kicker">OUTSIDE THE BUILD</p>
        <h3>Interests that show up in my work anyway</h3>
        <ul class="interests-list">${interests}</ul>
      </div>
    `
  );
}

function renderGuiSkills() {
  const cards = SKILLS.map(
    (group) => `
      <article class="gui-card skill-card">
        <p class="card-kicker">STACK</p>
        <h3>${group.title}</h3>
        <div class="chip-group">${group.items.map((item) => `<span class="skill-chip">${item}</span>`).join("")}</div>
      </article>
    `
  ).join("");

  renderStandardSection(
    "gui-skills",
    "SKILLS",
    "Skills",
    "I do not try to present everything as a flat wall of buzzwords. These are the areas I actually use to build, debug, and iterate.",
    `
      <div class="gui-grid">${cards}</div>
      <div class="focus-panel compact-panel">
        <div>
          <p class="card-kicker">WORKING STYLE</p>
          <h3>What matters more than the checklist</h3>
        </div>
        <p>
          I care most about shipping focused software, learning domains deeply enough to make good product decisions,
          and writing code that stays understandable after the first demo.
        </p>
      </div>
    `
  );
}

function renderGuiProjects() {
  const cards = PROJECTS.map((project) => {
    const filename = `${slugify(project.title)}.md`;
    return `
      <article class="gui-project-card">
        <div class="project-topline">
          <span class="project-status ${slugify(project.status)}">${project.status}</span>
          <span class="project-badge">${project.badge}</span>
        </div>
        <h3>${project.title}</h3>
        <p class="project-summary">${project.summary}</p>
        <p class="project-description">${project.description}</p>
        <ul class="project-bullets">${(project.bullets || []).map((item) => `<li>${item}</li>`).join("")}</ul>
        <div class="project-tech">${(project.tech || []).map((item) => `<span class="tech-tag">${item}</span>`).join("")}</div>
        <div class="project-links">
          <a class="project-link primary" href="${project.link}" target="_blank" rel="noreferrer">Repository</a>
          <button class="project-link" onclick="jumpToProjectFile('${filename}')">Read in Terminal</button>
        </div>
      </article>
    `;
  }).join("");

  renderStandardSection(
    "gui-projects",
    "PROJECTS",
    "Projects",
    "These projects are here because they reflect how I think: practical problems, clear user value, and a willingness to learn by building.",
    `
      <div class="gui-grid project-grid">${cards}</div>
      <div class="gui-cta-section">
        <p>Want the broader repo list as well?</p>
        <a class="gui-button" href="${PROFILE.github}" target="_blank" rel="noreferrer">Visit My GitHub</a>
      </div>
    `
  );
}

function renderGuiExperience() {
  const timeline = EXPERIENCE.map((item) => {
    const company = item.companyUrl
      ? `<a href="${item.companyUrl}" target="_blank" rel="noreferrer">${item.company}</a>`
      : item.company;

    return `
      <article class="timeline-item">
        <div class="timeline-date">${item.dates}</div>
        <div class="timeline-content">
          <p class="card-kicker">EXPERIENCE</p>
          <h3>${item.title}</h3>
          <h4>${company} • ${item.location}</h4>
          <p class="timeline-summary">${item.summary}</p>
          <div class="timeline-achievements">${(item.bullets || []).map((bullet) => `<span>${bullet}</span>`).join("")}</div>
          <div class="timeline-tech">${(item.tech || []).map((tech) => `<span class="tech-badge">${tech}</span>`).join("")}</div>
        </div>
      </article>
    `;
  }).join("");

  renderStandardSection(
    "gui-experience",
    "EXPERIENCE",
    "Experience",
    "I want the experience section to show progression rather than a flat list of titles. The through-line is practical engineering, communication, and learning by doing.",
    `
      <div class="gui-timeline">${timeline}</div>
      <div class="gui-experience-cta">
        <p>Interested in talking through any of this?</p>
        <button class="gui-button primary" onclick="showGuiSection('contact')">Get In Touch</button>
      </div>
    `
  );
}

function renderGuiContact() {
  const methods = (CONTACT.methods || [])
    .map(
      (item) => `
        <article class="gui-card contact-card">
          <p class="card-kicker">${item.label.toUpperCase()}</p>
          <p><a href="${item.href}" target="${item.href.startsWith("mailto:") ? "_self" : "_blank"}" rel="noreferrer">${item.value}</a></p>
        </article>
      `
    )
    .join("");

  renderStandardSection(
    "gui-contact",
    "CONTACT",
    "Contact",
    CONTACT.intro,
    `
      <div class="gui-grid">${methods}</div>
      <div class="gui-hero-buttons" style="margin-top: 24px;">
        <a class="gui-button primary" href="${PROFILE.resumeUrl}" target="_blank" rel="noreferrer">Resume</a>
        <a class="gui-button" href="${PROFILE.github}" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    `
  );
}

function renderGuiSections() {
  renderGuiHome();
  renderGuiNow();
  renderGuiAbout();
  renderGuiSkills();
  renderGuiProjects();
  renderGuiExperience();
  renderGuiContact();
}

function updateActiveNav(sectionId) {
  document.querySelectorAll(".gui-nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.section === sectionId);
  });
}

function setMode(mode) {
  currentMode = mode;
  const body = document.body;

  body.classList.remove("gui-mode", "quant-mode");
  hideQuickCommands();

  if (mode === "gui") {
    if (history.replaceState) history.replaceState(null, "", window.location.pathname);
    body.classList.add("gui-mode");
    sectionTransitioning = false;
    // Use direct show for mode switch entry
    document.querySelectorAll(".gui-section").forEach((s) => s.classList.remove("active", "section-exit", "section-enter"));
    const home = document.getElementById("gui-home");
    if (home) {
      home.classList.add("active");
      updateActiveNav("home");
    }
    window.scrollTo(0, 0);
    init3DBackground();
    clearSkillFilter();
    setTimeout(() => {
      triggerScrambleOnVisible();
      initSkillProjectLinking();
      initHolographicCards();
    }, 100);
    return;
  }

  if (mode === "quant") {
    body.classList.add("quant-mode");
    window.scrollTo(0, 0);
    destroy3DBackground();
    renderQuantInline();
    startQuantInlineClock();
    return;
  }

  if (history.replaceState) history.replaceState(null, "", window.location.pathname);
  destroy3DBackground();

  // Flash terminal boot screen on every switch to terminal mode
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) {
    // Reset boot-line animations by cloning the progress container
    const progress = loadingScreen.querySelector(".boot-progress");
    if (progress) {
      const clone = progress.cloneNode(true);
      progress.replaceWith(clone);
    }
    loadingScreen.classList.remove("hidden");
    setTimeout(() => loadingScreen.classList.add("hidden"), 950);
  }

  if (terminalSystem) terminalSystem.focusInput();
}
window.setMode = setMode;

function showGuiSection(sectionId) {
  document.querySelectorAll(".gui-section").forEach((section) => section.classList.remove("active"));
  const target = document.getElementById(`gui-${sectionId}`);
  if (target) {
    target.classList.add("active");
    updateActiveNav(sectionId);
    window.scrollTo(0, 0);
  }
}

function init3DBackground() {
  const canvas = document.getElementById("canvas3d");
  if (!canvas || renderer3d || !window.THREE) return;

  const THREE = window.THREE;

  scene3d = new THREE.Scene();
  camera3d = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer3d = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer3d.setSize(window.innerWidth, window.innerHeight);
  renderer3d.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer3d.setClearColor(0x000000, 0);

  shapes3d = [];

  // === Central icosahedron — dense wireframe globe ===
  const mainGeo = new THREE.IcosahedronGeometry(2.8, 4);
  const mainMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, wireframe: true, transparent: true,
    opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const mainSphere = new THREE.Mesh(mainGeo, mainMat);
  scene3d.add(mainSphere);
  shapes3d.push(mainSphere);

  // === Secondary icosahedron — floating offset ===
  const secGeo = new THREE.IcosahedronGeometry(1.5, 3);
  const secMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, wireframe: true, transparent: true,
    opacity: 0.11, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const secSphere = new THREE.Mesh(secGeo, secMat);
  secSphere.position.set(4.0, 1.8, -2.5);
  scene3d.add(secSphere);
  shapes3d.push(secSphere);

  // === Torus ring 1 — close orbit ===
  const ring1Geo = new THREE.TorusGeometry(3.8, 0.018, 4, 160);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true,
    opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI * 0.35;
  scene3d.add(ring1);
  shapes3d.push(ring1);

  // === Torus ring 2 — wide outer orbit ===
  const ring2Geo = new THREE.TorusGeometry(5.2, 0.012, 4, 200);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true,
    opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI * 0.55;
  ring2.rotation.z = Math.PI * 0.2;
  scene3d.add(ring2);
  shapes3d.push(ring2);

  // === Particle cloud — spherical shell of points ===
  const ptCount = 400;
  const ptPos = new Float32Array(ptCount * 3);
  for (let i = 0; i < ptCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 3.4 + Math.random() * 5.5;
    ptPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    ptPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    ptPos[i * 3 + 2] = r * Math.cos(phi);
  }
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute("position", new THREE.BufferAttribute(ptPos, 3));
  const ptMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.048, transparent: true,
    opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false
  });
  const pointCloud = new THREE.Points(ptGeo, ptMat);
  scene3d.add(pointCloud);
  shapes3d.push(pointCloud); // index 4

  // === Debris — small wireframe shapes scattered around ===
  const debrisGeos = [
    new THREE.TetrahedronGeometry(0.16),
    new THREE.OctahedronGeometry(0.13),
    new THREE.IcosahedronGeometry(0.11, 1)
  ];
  for (let i = 0; i < 16; i++) {
    const geo = debrisGeos[i % debrisGeos.length];
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff, wireframe: true, transparent: true,
      opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 4.0 + Math.random() * 4.5;
    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0);
    mesh.userData.rx = (Math.random() - 0.5) * 0.014;
    mesh.userData.ry = (Math.random() - 0.5) * 0.014;
    scene3d.add(mesh);
    shapes3d.push(mesh);
  }

  camera3d.position.z = 10;
  camera3d.userData.tx = 0;
  camera3d.userData.ty = 0;

  const animate3D = () => {
    animationId3d = requestAnimationFrame(animate3D);
    const t = Date.now() * 0.001;
    const mx = (mouseX / window.innerWidth) * 2 - 1;
    const my = -(mouseY / window.innerHeight) * 2 + 1;

    // Central sphere: slow rotation + mouse tilt
    mainSphere.rotation.x = t * 0.055 + my * 0.28;
    mainSphere.rotation.y = t * 0.085 + mx * 0.28;

    // Secondary sphere: counter-spin + vertical float
    secSphere.rotation.x -= 0.004;
    secSphere.rotation.y += 0.007;
    secSphere.position.y = 1.8 + Math.sin(t * 0.45) * 0.35;

    // Rings orbit
    ring1.rotation.y = t * 0.18;
    ring2.rotation.z = Math.PI * 0.2 + t * 0.1;
    ring2.rotation.y = t * 0.065;

    // Particle cloud slow drift
    pointCloud.rotation.y = t * 0.022;
    pointCloud.rotation.x = t * 0.011;

    // Debris: individual spins
    for (let i = 5; i < shapes3d.length; i++) {
      shapes3d[i].rotation.x += shapes3d[i].userData.rx;
      shapes3d[i].rotation.y += shapes3d[i].userData.ry;
    }

    // Camera parallax with mouse
    camera3d.userData.tx += (mx * 1.1 - camera3d.userData.tx) * 0.05;
    camera3d.userData.ty += (my * 0.75 - camera3d.userData.ty) * 0.05;
    camera3d.position.x = camera3d.userData.tx;
    camera3d.position.y = camera3d.userData.ty;
    camera3d.lookAt(0, 0, 0);

    renderer3d.render(scene3d, camera3d);
  };

  animate3D();
}

function destroy3DBackground() {
  if (!renderer3d) return;

  cancelAnimationFrame(animationId3d);
  shapes3d.forEach((shape) => {
    if (shape.geometry) shape.geometry.dispose();
    if (shape.material) shape.material.dispose();
  });

  renderer3d.dispose();
  renderer3d = null;
  scene3d = null;
  camera3d = null;
  shapes3d = [];
}

function handleResize() {
  if (!renderer3d || !camera3d) return;
  camera3d.aspect = window.innerWidth / window.innerHeight;
  camera3d.updateProjectionMatrix();
  renderer3d.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", handleResize);

function showQuickCommands() {
  quickCommandsVisible = true;
  document.getElementById("quickCommandsBar").classList.add("visible");
  const terminalBody = document.querySelector(".terminal-body");
  if (terminalBody) terminalBody.style.paddingBottom = "280px";
}
window.showQuickCommands = showQuickCommands;

function hideQuickCommands() {
  quickCommandsVisible = false;
  document.getElementById("quickCommandsBar").classList.remove("visible");
  const terminalBody = document.querySelector(".terminal-body");
  if (terminalBody) terminalBody.style.paddingBottom = "0";
  if (terminalSystem) terminalSystem.focusInput();
}
window.hideQuickCommands = hideQuickCommands;

function executeQuickCommand(command) {
  if (!terminalSystem) return;
  hideQuickCommands();

  if (command.startsWith("cat ~/")) {
    const path = command.slice(6);
    const parts = path.split("/");
    if (parts.length > 1) {
      const directory = parts.slice(0, -1).join("/");
      const file = parts[parts.length - 1];
      if (terminalSystem.currentPath !== `~/${directory}`) {
        terminalSystem.runCommand("cd ~");
        terminalSystem.runCommand(`cd ${directory}`);
      }
      terminalSystem.runCommand(`cat ${file}`);
      return;
    }
  }

  terminalSystem.runCommand(command);
}
window.executeQuickCommand = executeQuickCommand;

function jumpToProjectFile(filename) {
  setMode("terminal");
  setTimeout(() => executeQuickCommand(`cat ~/projects/${filename}`), 100);
}
window.jumpToProjectFile = jumpToProjectFile;

class HackGame {
  constructor() {
    this.container = document.getElementById("hackingContainer");
    this.output = document.getElementById("hackingOutput");
    this.input = document.getElementById("hackingInput");
    this.exitButton = document.querySelector(".hacking-exit-btn");
    this.closeButton = document.querySelector(".hacking-close-btn");
    this.typingIndicator = document.getElementById("hackTypingIndicator");
    this.meta = document.getElementById("hackMeta");
    this.level = 1;
    this.integrity = 100;
    this.score = 0;
    this.active = false;
    this.isTyping = false;
    this.levels = {
      1: {
        title: "LEVEL 1: ACCESS LOG",
        question: 'What year did Jeremy Lin create "Linsanity" in the NBA?',
        answer: "2012",
        hint: "It happened in February between 2010 and 2015.",
        scan: "SCAN RESULT: Sports memory shard recovered. Event tagged FEB-2012."
      },
      2: {
        title: "LEVEL 2: PORT CHECK",
        question: "Which port does HTTPS use by default?",
        answer: "443",
        hint: "It is the secure version of common web traffic.",
        scan: "SCAN RESULT: Secure transport channel detected on a three-digit port."
      },
      3: {
        title: "LEVEL 3: STACK VERIFY",
        question: "Complete this: HTML, CSS, and _____?",
        answer: "javascript",
        hint: "The language that makes the web come alive.",
        scan: "SCAN RESULT: Frontend runtime signature found."
      },
      4: {
        title: "LEVEL 4: PATTERN LOCK",
        question: "What comes next: 3, 6, 12, 24, ___?",
        answer: "48",
        hint: "The sequence doubles each step.",
        scan: "SCAN RESULT: Multiplicative pattern identified. Ratio remains constant."
      },
      5: {
        title: "FINAL LEVEL: COURTESY KEY",
        question: 'Type the magic word: "please"',
        answer: "please",
        hint: "Manners matter.",
        scan: "SCAN RESULT: Human layer bypass requires basic politeness."
      }
    };
  }

  open() {
    this.active = true;
    this.level = 1;
    this.integrity = 100;
    this.score = 0;
    this.setTyping(false);
    this.output.innerHTML = "";
    this.input.value = "";
    this.container.classList.add("active");
    this.bindEvents();
    this.updateMeta();
    this.focus();
    this.runIntro();
  }

  bindEvents() {
    this.input.onkeydown = (event) => {
      if (!this.active) return;

      const command = this.input.value.trim();
      const commandName = command.split(" ")[0];

      if (
        event.key === "Enter" &&
        (!this.isTyping || commandName === "exit" || commandName === "quit")
      ) {
        if (!command) return;
        this.addLine(`hacker@breach:~$ ${command}`, "hack-command");
        this.process(command);
        this.input.value = "";
      } else if (event.key === "Escape") {
        this.exit();
      }
    };

    this.container.onclick = (event) => {
      if (!event.target.closest(".hacking-exit-btn") && !event.target.closest(".hacking-close-btn")) {
        this.focus();
      }
    };

    if (this.exitButton) this.exitButton.onclick = () => this.exit();
    if (this.closeButton) this.closeButton.onclick = () => this.exit();
  }

  focus() {
    setTimeout(() => this.input.focus(), 0);
  }

  async runIntro() {
    const intro = [
      { text: "=== WELCOME TO HACK MODE ===", className: "hack-section" },
      { text: "", className: "" },
      { text: "Initializing security challenge...", className: "hack-info" },
      { text: "Loading breach modules...", className: "hack-warning" },
      { text: "System ready.", className: "hack-success" },
      { text: "", className: "" },
      { text: "Commands:", className: "hack-warning" },
      { text: "  answer <your_answer> - Submit your answer", className: "hack-info" },
      { text: "  scan - Reveal extra intel for this level", className: "hack-info" },
      { text: "  status - Show current level, integrity, and score", className: "hack-info" },
      { text: "  hint - Get a hint for the current level", className: "hack-info" },
      { text: "  skip - Skip to next level", className: "hack-info" },
      { text: "  exit - Leave hack mode", className: "hack-info" },
      { text: "", className: "" }
    ];

    await this.typeLines(intro);
    this.startLevel(1);
    this.focus();
  }

  async typeLines(lines, speed = 18) {
    this.setTyping(true);
    for (const line of lines) {
      await this.typeLine(line.text, line.className, speed);
      await this.wait(120);
    }
    this.setTyping(false);
  }

  typeLine(text, className = "", speed = 18) {
    return new Promise((resolve) => {
      const node = document.createElement("div");
      node.className = `hack-line ${className}`;
      this.output.appendChild(node);

      if (!text) {
        this.scroll();
        resolve();
        return;
      }

      let index = 0;
      const step = () => {
        if (index < text.length) {
          node.textContent = text.slice(0, index + 1);
          index += 1;
          this.scroll();
          setTimeout(step, speed);
        } else {
          this.scroll();
          resolve();
        }
      };

      step();
    });
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  setTyping(active) {
    this.isTyping = active;
    if (this.typingIndicator) this.typingIndicator.style.opacity = active ? "1" : "0";
  }

  updateMeta() {
    if (!this.meta) return;
    this.meta.textContent = `LV${this.level} | Integrity ${this.integrity}% | Score ${this.score}`;
  }

  startLevel(level) {
    const data = this.levels[level];
    if (!data) {
      this.victory();
      return;
    }

    this.level = level;
    this.updateMeta();
    this.typeLines([
      { text: "", className: "" },
      { text: "--------------------------------------------------", className: "hack-section" },
      { text: data.title, className: "hack-section" },
      { text: "--------------------------------------------------", className: "hack-section" },
      { text: data.question, className: "hack-warning" },
      { text: 'Type "scan" for intel or "answer <your_answer>" to submit', className: "hack-info" }
    ]);
  }

  process(raw) {
    const [command, ...rest] = raw.split(" ");
    const answer = rest.join(" ").trim();

    if (command === "exit" || command === "quit") {
      this.exit();
      return;
    }

    if (command === "hint") {
      const level = this.levels[this.level];
      if (level) this.typeLine(`HINT: ${level.hint}`, "hack-warning");
      return;
    }

    if (command === "scan") {
      const level = this.levels[this.level];
      if (level) this.typeLine(level.scan, "hack-info");
      return;
    }

    if (command === "status") {
      this.typeLine(`STATUS: Level ${this.level} | Integrity ${this.integrity}% | Score ${this.score}`, "hack-info");
      return;
    }

    if (command === "skip") {
      this.integrity = Math.max(0, this.integrity - 10);
      this.updateMeta();
      this.typeLines([{ text: "Skipping level. Integrity reduced by 10.", className: "hack-warning" }]).then(() =>
        this.startLevel(this.level + 1)
      );
      return;
    }

    if (command === "answer") {
      if (!answer) {
        this.typeLine("Usage: answer <your_answer>", "hack-error");
        return;
      }

      const level = this.levels[this.level];
      if (answer.toLowerCase() === level.answer.toLowerCase()) {
        this.score += 25;
        this.updateMeta();
        this.typeLines([
          { text: "[SUCCESS] Correct answer!", className: "hack-success" },
          { text: `Score +25 | Total ${this.score}`, className: "hack-info" },
          { text: "Advancing...", className: "hack-info" }
        ]).then(() => this.startLevel(this.level + 1));
        return;
      }

      this.integrity = Math.max(0, this.integrity - 15);
      this.updateMeta();

      if (this.integrity === 0) {
        this.failure();
        return;
      }

      this.typeLines([
        { text: "[FAILED] Wrong answer. Integrity reduced by 15.", className: "hack-error" },
        { text: 'Type "scan", "hint", or "status" if you are stuck.', className: "hack-warning" }
      ]);
      return;
    }

    this.typeLine("Unknown command. Try: answer, scan, status, hint, skip, exit", "hack-error");
  }

  addLine(text, className = "") {
    const line = document.createElement("div");
    line.className = `hack-line ${className}`;
    line.textContent = text;
    this.output.appendChild(line);
    this.scroll();
  }

  async victory() {
    await this.typeLines([
      { text: "CONGRATULATIONS! YOU COMPLETED ALL LEVELS!", className: "hack-success" },
      { text: `Final score: ${this.score} | Integrity remaining: ${this.integrity}%`, className: "hack-info" },
      { text: "Secret message: keep learning, keep growing.", className: "hack-warning" },
      { text: "Closing in 3 seconds...", className: "hack-info" }
    ]);
    setTimeout(() => this.exit(), 3000);
  }

  async failure() {
    await this.typeLines([
      { text: "SYSTEM INTEGRITY CRITICAL.", className: "hack-error" },
      { text: "Challenge failed. Rebooting level sequence...", className: "hack-warning" }
    ]);
    this.level = 1;
    this.integrity = 100;
    this.score = 0;
    this.updateMeta();
    this.startLevel(1);
  }

  exit() {
    this.active = false;
    this.setTyping(false);
    this.container.classList.remove("active");
    this.output.innerHTML = "";
    this.input.value = "";
    this.level = 1;
    this.integrity = 100;
    this.score = 0;
    this.updateMeta();
    if (terminalSystem) {
      terminalSystem.addOutput("Exited hack mode.", "info");
      terminalSystem.scrollToBottom();
      terminalSystem.focusInput();
    }
  }

  scroll() {
    this.output.scrollTop = this.output.scrollHeight;
  }
}

class TerminalPortfolio {
  constructor() {
    this.output = document.getElementById("terminalOutput");
    this.input = document.getElementById("terminalInput");
    this.prompt = document.getElementById("prompt");
    this.cursor = document.getElementById("cursor");
    this.body = document.querySelector(".terminal-body");
    this.username = TERMINAL.username || "visitor";
    this.currentPath = "~";
    this.commandHistory = [];
    this.historyIndex = -1;
    this.matrixUnlocked = false;
    this.matrixMode = false;
    this.hackGame = new HackGame();
    this.fileSystem = this.buildFileSystem();
    this.commands = this.buildCommands();
    this.init();
  }

  init() {
    this.cmdCount = 0;
    this.idleTimer = null;
    this.idleLine = null;
    this.setupEvents();
    this.showWelcomeMessage();
    this.startClock();
    this.updatePrompt();
    this.updateCursorPosition();
    this.resetIdleTimer();
  }

  buildFileSystem() {
    const projectFiles = {};

    PROJECTS.forEach((project) => {
      const filename = `${slugify(project.title)}.md`;
      const content = [
        `${project.title.toUpperCase()}`,
        `${"=".repeat(project.title.length)}`,
        "",
        `Status: ${project.status}`,
        `Focus: ${project.badge}`,
        "",
        project.summary,
        "",
        project.description,
        "",
        "Highlights:",
        ...(project.bullets || []).map((bullet) => `- ${bullet}`),
        "",
        "Stack:",
        ...(project.tech || []).map((tech) => `- ${tech}`),
        "",
        `Repo: ${project.link}`
      ].join("\n");

      projectFiles[filename] = { type: "file", content };
    });

    projectFiles["README.md"] = {
      type: "file",
      content: [
        "CURRENT PROJECTS",
        "================",
        "",
        ...PROJECTS.map(
          (project) => `- ${project.title} [${project.status}] - ${project.summary}\n  Repo: ${project.link}`
        )
      ].join("\n")
    };

    const skillsContent = SKILLS.map(
      (group) => `${group.title}:\n- ${group.items.join("\n- ")}`
    ).join("\n\n");

    const experienceContent = EXPERIENCE.map((item) => {
      const companyLine = item.companyUrl ? `${item.company} (${item.companyUrl})` : item.company;
      return [
        `${item.title} @ ${companyLine}`,
        `${item.dates} | ${item.location}`,
        item.summary,
        ...(item.bullets || []).map((bullet) => `- ${bullet}`)
      ].join("\n");
    }).join("\n\n");

    const bioContent = [
      PROFILE.name.toUpperCase(),
      `${"=".repeat(PROFILE.name.length)}`,
      "",
      `Role: ${PROFILE.role}`,
      `Location: ${PROFILE.location}`,
      "",
      ABOUT.intro || "",
      "",
      "Right now:",
      ...(NOW.focus || []).map((item) => `- ${item}`),
      "",
      "Links:",
      `- GitHub: ${PROFILE.github}`,
      `- LinkedIn: ${PROFILE.linkedin}`,
      `- Current company: https://thisisgain.com`
    ].join("\n");

    const currentContent = [
      "CURRENT SNAPSHOT",
      "================",
      "",
      "Current role:",
      "- Software Engineer Intern at GAIN",
      "- Company: https://thisisgain.com",
      "",
      "Current build:",
      "- QuantPilot",
      "- Repo: https://github.com/hurchey/QuantPilot",
      "",
      "Recent finished work:",
      "- Court Vision",
      "- Health AI Chatbot"
    ].join("\n");

    const focusContent = [
      "CURRENT FOCUS",
      "=============",
      "",
      ...(NOW.focus || []).map((item) => `- ${item}`)
    ].join("\n");

    const interestsContent = [
      "INTERESTS",
      "=========",
      "",
      ...(ABOUT.interests || []).map((item) => `- ${item}`)
    ].join("\n");

    const contactContent = [
      "CONTACT",
      "=======",
      "",
      `Email: ${PROFILE.email}`,
      `LinkedIn: ${PROFILE.linkedin}`,
      `GitHub: ${PROFILE.github}`,
      "GAIN: https://thisisgain.com"
    ].join("\n");

    return {
      "~": {
        type: "directory",
        contents: {
          about: {
            type: "directory",
            contents: {
              "bio.txt": { type: "file", content: bioContent },
              "interests.txt": { type: "file", content: interestsContent }
            }
          },
          now: {
            type: "directory",
            contents: {
              "current.md": { type: "file", content: currentContent },
              "focus.txt": { type: "file", content: focusContent }
            }
          },
          skills: {
            type: "directory",
            contents: {
              "summary.txt": { type: "file", content: skillsContent }
            }
          },
          projects: {
            type: "directory",
            contents: projectFiles
          },
          experience: {
            type: "directory",
            contents: {
              "current.txt": { type: "file", content: experienceContent }
            }
          },
          "contact.txt": { type: "file", content: contactContent },
          "resume.pdf": { type: "file", content: '[Use "download resume" to fetch the PDF]' }
        }
      }
    };
  }

  buildCommands() {
    return {
      help: () => this.showHelp(),
      "?": () => this.showHelp(),
      clear: () => this.clearTerminal(),
      ls: (args) => this.listDirectory(args),
      cd: (args) => this.changeDirectory(args),
      pwd: () => this.printWorkingDirectory(),
      cat: (args) => this.readFile(args),
      whoami: () => this.addOutput(`${PROFILE.name} | ${PROFILE.role}`, "info"),
      date: () => this.addOutput(new Date().toString(), "info"),
      echo: (args) => this.addOutput(args.join(" "), "info"),
      now: () => this.readFile(["~/now/current.md"]),
      contact: () => this.readFile(["~/contact.txt"]),
      resume: () => this.downloadFile(["resume"]),
      download: (args) => this.downloadFile(args),
      gui: () => this.switchToGui(),
      quant: () => this.openQuantSite(),
      trace: () => this.traceMatrix(),
      signal: () => this.matrixSignal(),
      "exit-matrix": () => this.exitMatrix(),
      find: (args) => this.findFiles(args),
      grep: (args) => this.grepFiles(args),
      history: () => this.showHistory(),
      exit: () => this.addOutput("Use the GUI button or close the tab to exit.", "warning"),
      hack: () => this.startHackingGame(),
      matrix: () => this.matrixEffect(),
      "red pill": () => this.redPill(),
      "blue pill": () => this.bluePill(),
      red: () => this.redPill(),
      blue: () => this.bluePill(),
      knicks: () => this.easterEggKnicks(),
      violin: () => this.easterEggViolin(),
      linsanity: () => this.easterEggLinsanity()
    };
  }

  setupEvents() {
    // Ghost text element inside the input container
    this.ghostEl = document.createElement("span");
    this.ghostEl.className = "terminal-ghost";
    const inputContainer = document.querySelector(".terminal-input-container");
    if (inputContainer) inputContainer.appendChild(this.ghostEl);

    this.input.addEventListener("keydown", (event) => this.handleKeyPress(event));

    this.input.addEventListener("input", () => {
      this.updateCursorPosition();
      this.updateGhostText();
      this.flashCursor();
      this.clearIdleLine();
      this.resetIdleTimer();
    });

    this.input.addEventListener("click", () => this.updateCursorPosition());

    document.addEventListener("selectionchange", () => {
      if (document.activeElement === this.input) this.updateCursorPosition();
    });

    document.addEventListener("click", (event) => {
      const hackActive = document.getElementById("hackingContainer").classList.contains("active");
      if (currentMode === "terminal" && !hackActive && !event.target.closest(".quick-commands-bar")) {
        this.focusInput();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && quickCommandsVisible) hideQuickCommands();
    });
  }

  flashCursor() {
    if (!this.cursor) return;
    this.cursor.classList.remove("flash");
    // Force reflow so re-adding the class triggers the animation
    void this.cursor.offsetWidth;
    this.cursor.classList.add("flash");
    setTimeout(() => this.cursor.classList.remove("flash"), 140);
  }

  updateGhostText() {
    if (!this.ghostEl) return;
    const val = this.input.value;
    if (!val) { this.ghostEl.textContent = ""; return; }

    const completion = this.getCompletion(val);
    if (completion && completion.startsWith(val) && completion !== val) {
      this.ghostEl.textContent = completion;
      // Position ghost at cursor left offset
      this.ghostEl.style.left = "0px";
    } else {
      this.ghostEl.textContent = "";
    }
  }

  getCompletion(val) {
    const commandNames = Object.keys(this.commands).filter(c => !c.includes(" "));
    const topLevel = [...commandNames, "ls", "cd", "cat", "pwd"];

    // Complete bare command names
    const matchedCmd = topLevel.find(c => c.startsWith(val) && c !== val);
    if (matchedCmd) return matchedCmd;

    // Complete paths for cat / cd
    const catMatch = val.match(/^(cat|cd)\s+(~\/[\w/-]*)$/);
    if (catMatch) {
      const prefix = catMatch[2];
      const parts = prefix.split("/");
      const segment = parts.pop();
      const dirPath = parts.join("/") || "~";
      const dirNode = this.resolveDirNode(dirPath);
      if (dirNode && dirNode.contents) {
        const match = Object.keys(dirNode.contents).find(n => n.startsWith(segment) && n !== segment);
        if (match) return `${catMatch[1]} ${dirPath}/${match}`;
      }
    }

    return null;
  }

  resolveDirNode(path) {
    if (path === "~") return this.fileSystem["~"];
    const parts = path.replace(/^~\//, "").split("/");
    let node = this.fileSystem["~"];
    for (const part of parts) {
      if (!part || !node.contents || !node.contents[part]) return null;
      node = node.contents[part];
    }
    return node;
  }

  focusInput() {
    setTimeout(() => this.input.focus(), 0);
  }

  updateCursorPosition() {
    const cursorPosition = this.input.selectionStart || 0;
    const textBeforeCursor = this.input.value.substring(0, cursorPosition);
    const measurer = document.createElement("span");
    measurer.style.position = "absolute";
    measurer.style.visibility = "hidden";
    measurer.style.font = getComputedStyle(this.input).font;
    measurer.style.whiteSpace = "pre";
    measurer.textContent = textBeforeCursor;
    document.body.appendChild(measurer);
    const width = measurer.getBoundingClientRect().width;
    document.body.removeChild(measurer);
    this.cursor.style.left = `${width}px`;
  }

  handleKeyPress(event) {
    if (event.key === "Enter") {
      this.ghostEl && (this.ghostEl.textContent = "");
      this.executeCommand();
    } else if (event.key === "Tab") {
      event.preventDefault();
      // Accept ghost completion if one exists, otherwise open quick commands
      const ghost = this.ghostEl && this.ghostEl.textContent;
      if (ghost && ghost.startsWith(this.input.value) && ghost !== this.input.value) {
        this.input.value = ghost;
        this.ghostEl.textContent = "";
        this.updateCursorPosition();
        this.flashCursor();
      } else {
        quickCommandsVisible ? hideQuickCommands() : showQuickCommands();
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      this.ghostEl && (this.ghostEl.textContent = "");
      this.navigateHistory(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      this.ghostEl && (this.ghostEl.textContent = "");
      this.navigateHistory(1);
    } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      this.clearTerminal();
    } else if (event.key === "Escape" && quickCommandsVisible) {
      event.preventDefault();
      hideQuickCommands();
    }

    setTimeout(() => this.updateCursorPosition(), 0);
  }

  runCommand(command) {
    this.input.value = command;
    this.executeCommand();
  }

  executeCommand() {
    const fullCommand = this.input.value.trim();
    if (!fullCommand) return;

    this.clearIdleLine();
    this.resetIdleTimer();
    this.cmdCount++;
    this.updateHud();

    this.commandHistory.push(fullCommand);
    this.historyIndex = this.commandHistory.length;
    this.addOutput(`${this.prompt.textContent} ${fullCommand}`, "command");

    const rawParts = fullCommand.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const parts = rawParts.map((part) => part.replace(/^"|"$/g, ""));
    const command = parts[0];
    const compoundCommand = parts.slice(0, 2).join(" ");

    let handler = null;
    let argOffset = 1;

    if (this.commands[compoundCommand]) {
      handler = this.commands[compoundCommand];
      argOffset = 2;
    } else if (this.commands[command]) {
      handler = this.commands[command];
    }

    if (handler) {
      handler(parts.slice(argOffset));
    } else {
      this.addOutput(`bash: ${command}: command not found`, "error");
    }

    this.input.value = "";
    this.updateCursorPosition();
    this.scrollToBottom();
  }

  getCurrentDirectory() {
    const parts = this.currentPath.split("/");
    let current = this.fileSystem["~"];

    for (let index = 1; index < parts.length; index += 1) {
      if (parts[index] && current.contents && current.contents[parts[index]]) {
        current = current.contents[parts[index]];
      }
    }

    return current;
  }

  changeDirectory(args) {
    if (!args || args.length === 0 || args[0] === "~") {
      this.currentPath = "~";
      this.updatePrompt();
      return;
    }

    if (args[0] === "..") {
      const parts = this.currentPath.split("/");
      if (parts.length > 1) parts.pop();
      this.currentPath = parts.join("/") || "~";
      this.updatePrompt();
      return;
    }

    const target = this.currentPath === "~" ? `~/${args[0]}` : `${this.currentPath}/${args[0]}`;
    const parts = target.split("/");
    let current = this.fileSystem["~"];
    let valid = true;

    for (let index = 1; index < parts.length; index += 1) {
      if (
        parts[index] &&
        current.contents &&
        current.contents[parts[index]] &&
        current.contents[parts[index]].type === "directory"
      ) {
        current = current.contents[parts[index]];
      } else {
        valid = false;
        break;
      }
    }

    if (!valid) {
      this.addOutput(`bash: cd: ${args[0]}: No such file or directory`, "error");
      return;
    }

    this.currentPath = target;
    this.updatePrompt();
  }

  listDirectory() {
    const directory = this.getCurrentDirectory();
    if (!directory || directory.type !== "directory") {
      this.addOutput("Not a directory", "error");
      return;
    }

    const items = Object.entries(directory.contents || {}).map(([name, item]) => {
      const display = item.type === "directory" ? `${name}/` : name;
      const cssClass = item.type === "directory" ? "clickable-item directory" : "clickable-item";
      return `<span class="${cssClass}" onclick="terminalSystem.handleItemClick('${name}')">${display}</span>`;
    });

    const line = document.createElement("div");
    line.className = "output-line output-info";
    line.innerHTML = items.join("  ");
    this.output.appendChild(line);
    this.addOutput("", "");
  }

  handleItemClick(name) {
    const directory = this.getCurrentDirectory();
    if (!directory.contents || !directory.contents[name]) return;

    if (directory.contents[name].type === "directory") {
      this.runCommand(`cd ${name}`);
      return;
    }

    this.runCommand(`cat ${name}`);
  }

  resolvePath(path) {
    const normalized = path.startsWith("~/") ? path.slice(2) : path;
    const parts = normalized.split("/");
    let current = this.fileSystem["~"];

    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];
      if (!part) continue;

      if (current.contents && current.contents[part] && current.contents[part].type === "directory") {
        current = current.contents[part];
      } else {
        return null;
      }
    }

    return current.contents ? current.contents[parts[parts.length - 1]] : null;
  }

  readFile(args) {
    if (!args || args.length === 0) {
      this.addOutput("Usage: cat <filename>", "error");
      return;
    }

    const filePath = args[0];
    let target = null;

    if (filePath.includes("/")) {
      target = this.resolvePath(filePath);
    } else {
      const directory = this.getCurrentDirectory();
      target = directory.contents ? directory.contents[filePath] : null;
    }

    if (!target) {
      this.addOutput(`cat: ${filePath}: No such file or directory`, "error");
      return;
    }

    if (target.type === "directory") {
      this.addOutput(`cat: ${filePath}: Is a directory`, "error");
      return;
    }

    this.addHTML(formatFileContent(target.content), "info");
    this.scrollToBottom();
  }

  addOutput(text, className = "") {
    const line = document.createElement("div");
    line.className = `output-line ${className ? `output-${className}` : ""}`;
    line.textContent = text;
    this.output.appendChild(line);
  }

  addHTML(html, className = "") {
    const line = document.createElement("div");
    line.className = `output-line ${className ? `output-${className}` : ""}`;
    line.innerHTML = html;
    this.output.appendChild(line);
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.body.scrollTop = this.body.scrollHeight;
    });
  }

  showWelcomeMessage() {
    const asciiLines = [
      "███████╗██████╗ ██╗ ██████╗",
      "██╔════╝██╔══██╗██║██╔════╝",
      "█████╗  ██████╔╝██║██║     ",
      "██╔══╝  ██╔══██╗██║██║     ",
      "███████╗██║  ██║██║╚██████╗",
      "╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝",
      "",
      "██╗  ██╗██╗   ██╗██████╗  ██████╗██╗  ██╗███████╗██╗   ██╗",
      "██║  ██║██║   ██║██╔══██╗██╔════╝██║  ██║██╔════╝╚██╗ ██╔╝",
      "███████║██║   ██║██████╔╝██║     ███████║█████╗   ╚████╔╝ ",
      "██╔══██║██║   ██║██╔══██╗██║     ██╔══██║██╔══╝    ╚██╔╝  ",
      "██║  ██║╚██████╔╝██║  ██║╚██████╗██║  ██║███████╗   ██║   ",
      "╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   "
    ];

    const TAGLINE = "SOFTWARE ENGINEER // TERMINAL PORTFOLIO";
    const welcomeLines = [
      { text: 'Welcome. Type "help" or press Tab for quick commands.', cls: "success" },
      { text: "Current signal: Software Engineer Intern at GAIN.", cls: "info" },
      { text: 'Try "now", "ls", "gui", "quant", or "cat ~/projects/README.md".', cls: "info" }
    ];

    // Phase 1: ASCII art lines stagger in
    const asciiContainer = document.createElement("div");
    asciiContainer.className = "ascii-art-container";
    const pre = document.createElement("pre");
    pre.className = "ascii-art";
    pre.innerHTML = "";
    asciiContainer.appendChild(pre);
    this.output.appendChild(asciiContainer);

    asciiLines.forEach((line, i) => {
      setTimeout(() => {
        const span = document.createElement("span");
        span.className = "boot-line";
        span.style.animationDelay = "0s";
        span.style.display = "block";
        span.textContent = line;
        pre.appendChild(span);
        this.scrollToBottom();
      }, i * 55);
    });

    // Phase 2: Tagline types itself
    const tagDelay = asciiLines.length * 55 + 120;
    setTimeout(() => {
      const tagContainer = document.createElement("div");
      tagContainer.className = "ascii-art-container";
      const tagPre = document.createElement("pre");
      tagPre.className = "ascii-art ascii-tagline";
      tagPre.textContent = "";
      tagContainer.appendChild(tagPre);
      this.output.appendChild(tagContainer);
      this.typeTextInto(tagPre, TAGLINE, 28, () => {
        // Phase 3: Welcome lines stagger in
        this.addOutput("", "");
        welcomeLines.forEach((line, i) => {
          setTimeout(() => {
            this.addOutput(line.text, line.cls);
            if (i === welcomeLines.length - 1) {
              this.addOutput("", "");
              this.scrollToBottom();
            }
          }, i * 220);
        });
      });
    }, tagDelay);
  }

  typeTextInto(element, text, speed, done) {
    let i = 0;
    const step = () => {
      if (i < text.length) {
        element.textContent += text[i];
        i++;
        this.scrollToBottom();
        setTimeout(step, speed);
      } else if (done) {
        done();
      }
    };
    step();
  }

  showHelp() {
    this.addOutput("", "");
    this.addOutput("AVAILABLE COMMANDS:", "section");
    this.addOutput("  ls                 List directory contents", "info");
    this.addOutput("  cd <dir>           Change directory", "info");
    this.addOutput("  cat <file>         Show file contents", "info");
    this.addOutput("  now                Show current snapshot", "info");
    this.addOutput("  contact            Show contact details", "info");
    this.addOutput("  download resume    Open resume link", "info");
    this.addOutput("  gui                Switch to visual mode", "info");
    this.addOutput("  quant              Switch to quant mode", "info");
    this.addOutput("  find <pattern>     Find files by name", "info");
    this.addOutput("  grep <pattern>     Search inside files", "info");
    this.addOutput("  clear              Clear terminal", "info");
    this.addOutput("  hack               Launch hacking mini-game", "success");
    this.addOutput("  matrix             Matrix rain effect", "success");
    this.addOutput("  trace | signal | exit-matrix", "warning");
    this.addOutput("  red pill | blue pill", "warning");
    this.addOutput("  knicks | violin | linsanity", "warning");
    this.addOutput("", "");
    this.scrollToBottom();
  }

  clearTerminal() {
    this.output.innerHTML = "";
    this.currentPath = "~";
    this.matrixUnlocked = false;
    this.matrixMode = false;
    this.updatePrompt();
    if (this.ghostEl) this.ghostEl.textContent = "";
    this.showWelcomeMessage();
  }

  printWorkingDirectory() {
    const root = TERMINAL.homeDirectory || "/home/eric";
    const path = this.currentPath === "~" ? root : this.currentPath.replace("~", root);
    this.addOutput(path, "info");
  }

  downloadFile(args) {
    if (!args || args[0] !== "resume") {
      this.addOutput("Usage: download resume", "error");
      return;
    }

    this.addOutput("Initializing download manager...", "warning");
    this.scrollToBottom();

    setTimeout(() => {
      this.addOutput("Connecting to server...", "info");
      this.scrollToBottom();
    }, 500);

    setTimeout(() => {
      this.addOutput("Fetching Eric Hurchey resume...", "info");
      this.scrollToBottom();
    }, 1100);

    setTimeout(() => {
      this.addOutput("Resume ready.", "success");
      const line = document.createElement("div");
      line.className = "output-line";
      line.innerHTML = `
        <span class="output-info">Open: ${PROFILE.resumeUrl}</span>
        <a class="inline-btn" href="${PROFILE.resumeUrl}" target="_blank" rel="noreferrer">Open Resume</a>
      `;
      this.output.appendChild(line);
      this.scrollToBottom();
    }, 1700);
  }

  switchToGui() {
    this.addOutput("Switching to visual mode...", "info");
    setTimeout(() => setMode("gui"), 300);
  }

  openQuantSite() {
    this.addOutput("Opening quant subsite...", "info");
    window.location.href = "quant.html";
  }

  findFiles(args) {
    if (!args || !args.length) {
      this.addOutput("Usage: find <pattern>", "error");
      return;
    }

    const pattern = args[0].toLowerCase();
    const results = [];

    const search = (directory, path) => {
      Object.entries(directory.contents || {}).forEach(([name, item]) => {
        const fullPath = path ? `${path}/${name}` : name;
        if (name.toLowerCase().includes(pattern)) results.push(fullPath);
        if (item.type === "directory") search(item, fullPath);
      });
    };

    search(this.fileSystem["~"], ".");

    if (!results.length) {
      this.addOutput(`find: no files matching "${pattern}"`, "warning");
      return;
    }

    results.forEach((result) => this.addOutput(`./${result}`, "info"));
  }

  grepFiles(args) {
    if (!args || args.length === 0) {
      this.addOutput("Usage: grep <pattern> [file]", "error");
      return;
    }

    const pattern = args[0].toLowerCase();
    const targetFile = args[1];
    const directory = this.getCurrentDirectory();

    const searchFile = (name, file) => {
      if (file.type !== "file") return;
      file.content.split("\n").forEach((line, index) => {
        if (line.toLowerCase().includes(pattern)) {
          this.addOutput(`${name}:${index + 1}: ${line}`, "info");
        }
      });
    };

    if (targetFile) {
      const file = directory.contents ? directory.contents[targetFile] : null;
      if (!file) {
        this.addOutput(`grep: ${targetFile}: No such file`, "error");
        return;
      }
      searchFile(targetFile, file);
      return;
    }

    Object.entries(directory.contents || {}).forEach(([name, item]) => searchFile(name, item));
  }

  showHistory() {
    this.commandHistory.forEach((command, index) => this.addOutput(`${index + 1}  ${command}`, "info"));
  }

  startHackingGame() {
    this.addOutput("", "");
    this.addOutput("Opening hack terminal...", "success");
    this.hackGame.open();
  }

  matrixEffect() {
    if (this.matrixMode) {
      this.addOutput("Matrix mode already active. Try trace, signal, red pill, blue pill, or exit-matrix.", "info");
      this.scrollToBottom();
      return;
    }

    this.addOutput("", "");
    this.addOutput("ENTERING THE MATRIX...", "success");
    this.matrixUnlocked = true;
    this.matrixMode = true;
    this.updatePrompt();

    const matrixChars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ0123456789";
    for (let i = 0; i < 3; i += 1) {
      let rain = "";
      for (let row = 0; row < 10; row += 1) {
        let line = "";
        for (let column = 0; column < 56; column += 1) {
          line += Math.random() > 0.3 ? matrixChars[Math.floor(Math.random() * matrixChars.length)] : " ";
        }
        rain += `${line}\n`;
      }
      this.addHTML(`<pre class="matrix-block" style="opacity: ${1 - i * 0.3};">${rain}</pre>`);
    }

    this.addOutput("Matrix shell active.", "success");
    this.addOutput('Available commands: trace, signal, red pill, blue pill, exit-matrix.', "warning");
    this.scrollToBottom();
  }

  redPill() {
    if (!this.matrixUnlocked) {
      this.addOutput('Take the "matrix" command first to unlock this choice.', "warning");
      this.scrollToBottom();
      return;
    }

    this.addOutput("", "");
    this.addOutput("You take the red pill...", "error");
    this.scrollToBottom();

    setTimeout(() => {
      this.addOutput("You stay in Wonderland...", "warning");
      this.addOutput("Welcome to the real world, Neo.", "success");
      if (this.matrixMode) {
        this.addOutput('Run "trace" to inspect nodes or "signal" to reveal a portfolio clue.', "info");
      }
      this.scrollToBottom();
    }, 400);
  }

  bluePill() {
    if (!this.matrixUnlocked) {
      this.addOutput('Take the "matrix" command first to unlock this choice.', "warning");
      this.scrollToBottom();
      return;
    }

    this.addOutput("", "");
    this.addOutput("You take the blue pill...", "info");
    this.scrollToBottom();

    setTimeout(() => {
      this.addOutput("The story ends. You wake in your bed and believe what you want.", "info");
      if (this.matrixMode) this.exitMatrix();
      this.scrollToBottom();
    }, 400);
  }

  traceMatrix() {
    if (!this.matrixMode) {
      this.addOutput('Trace is only available after entering "matrix".', "warning");
      this.scrollToBottom();
      return;
    }

    const nodes = [
      "node://gain/current-role",
      "node://quantpilot/backtesting",
      "node://projects/court-vision",
      "node://experience/mygenius",
      "node://contact/open-channel"
    ];

    this.addOutput("", "");
    this.addOutput("TRACE ROUTE:", "section");
    nodes.forEach((node, index) => {
      this.addOutput(`  ${index + 1}. ${node}`, index % 2 === 0 ? "info" : "success");
    });
    this.scrollToBottom();
  }

  matrixSignal() {
    if (!this.matrixMode) {
      this.addOutput('Signal is only available after entering "matrix".', "warning");
      this.scrollToBottom();
      return;
    }

    this.addOutput("", "");
    this.addOutput("SIGNAL REVEAL:", "section");
    this.addOutput("Current role: Software Engineer Intern at GAIN", "info");
    this.addOutput("Current build: QuantPilot backtesting and strategy research", "info");
    this.addOutput("Fast path: gui, quant, cat ~/projects/quantpilot.md", "warning");
    this.scrollToBottom();
  }

  exitMatrix() {
    if (!this.matrixMode) {
      this.addOutput("Matrix mode is not active.", "warning");
      this.scrollToBottom();
      return;
    }

    this.matrixMode = false;
    this.updatePrompt();
    this.addOutput("Exiting matrix shell...", "info");
    this.scrollToBottom();
  }

  easterEggKnicks() {
    this.addOutput("", "");
    this.addOutput("NEW YORK KNICKS AND GOLDEN STATE WARRIORS FAN", "success");
    this.addOutput("Favorite players: Jeremy Lin and Stephen Curry", "info");
    this.addOutput("Linsanity is still one of the best underdog stories in sports.", "warning");
    this.addOutput("", "");
  }

  easterEggViolin() {
    this.addOutput("", "");
    this.addOutput("CLASSICAL MUSICIAN MODE", "success");
    this.addOutput("14+ years of violin experience.", "info");
    this.addOutput("Music taught me discipline, teamwork, and attention to detail.", "warning");
    this.addOutput("", "");
  }

  easterEggLinsanity() {
    this.addOutput("", "");
    this.addOutput("LINSANITY FOREVER", "success");
    const art = `
+-------------------------------+
| February 2012 - never forget  |
| 7 games, 7 wins               |
| One of the best underdog runs |
+-------------------------------+`;
    this.addHTML(`<pre class="linsanity-block">${art}</pre>`);
    this.addOutput("Jeremy Lin showed what happens when preparation meets opportunity.", "info");
    this.addOutput("", "");
  }

  navigateHistory(direction) {
    if (!this.commandHistory.length) return;

    if (direction === -1 && this.historyIndex > 0) {
      this.historyIndex -= 1;
    } else if (direction === 1 && this.historyIndex < this.commandHistory.length - 1) {
      this.historyIndex += 1;
    } else if (direction === 1 && this.historyIndex === this.commandHistory.length - 1) {
      this.historyIndex = this.commandHistory.length;
      this.input.value = "";
      this.updateCursorPosition();
      return;
    }

    if (this.historyIndex >= 0 && this.historyIndex < this.commandHistory.length) {
      this.input.value = this.commandHistory[this.historyIndex];
      this.updateCursorPosition();
    }
  }

  updatePrompt() {
    if (this.matrixMode) {
      this.prompt.textContent = "neo@matrix:~$";
      return;
    }
    const pathLabel = this.currentPath === "~" ? "home" : this.currentPath.split("/").pop() || "home";
    this.prompt.textContent = `${this.username}@${pathLabel}:~$`;
  }

  startClock() {
    const update = () => {
      const time = document.getElementById("time");
      if (time) time.textContent = new Date().toTimeString().split(" ")[0];
    };
    update();
    setInterval(update, 1000);
  }

  updateHud() {
    const cmdEl = document.getElementById("hudCmdCount");
    if (cmdEl) cmdEl.textContent = String(this.cmdCount).padStart(3, "0");
  }

  resetIdleTimer() {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => this.showIdlePrompt(), 25000);
  }

  showIdlePrompt() {
    if (currentMode !== "terminal") return;
    this.clearIdleLine();
    this.idleLine = document.createElement("div");
    this.idleLine.className = "output-line output-idle-prompt";
    this.output.appendChild(this.idleLine);
    this.scrollToBottom();

    // Blink the text like an old game continue screen
    let visible = true;
    const msg = "▶ PRESS ANY KEY TO CONTINUE ◀";
    this.idleBlink = setInterval(() => {
      if (!this.idleLine) { clearInterval(this.idleBlink); return; }
      this.idleLine.textContent = visible ? msg : "";
      visible = !visible;
    }, 600);
    this.idleLine.textContent = msg;
  }

  clearIdleLine() {
    clearInterval(this.idleBlink);
    if (this.idleLine) {
      this.idleLine.remove();
      this.idleLine = null;
    }
  }
}

/* ── Quant inline mode ── */

const QUANT_SITE = PORTFOLIO.quantSite || {};
const QUANT_CURVES = {
  primary: [18, 24, 22, 29, 33, 31, 38, 44, 41, 49, 54, 57],
  secondary: [11, 15, 13, 19, 21, 18, 25, 27, 24, 31, 29, 35]
};

function quantSparkline(values, variant) {
  const w = 320, h = 96;
  const min = Math.min(...values), max = Math.max(...values);
  const step = w / (values.length - 1);
  const coords = values.map((v, i) => {
    const y = max === min ? h / 2 : h - ((v - min) / (max - min)) * (h - 14) - 7;
    return { x: i * step, y };
  });
  const pts = coords.map(p => `${p.x},${p.y}`).join(" ");
  const last = coords[coords.length - 1];
  const liveDot = variant === "primary"
    ? `<circle class="sparkline-live-dot" cx="${last.x}" cy="${last.y}" r="3"/>`
    : "";
  return `<svg class="sparkline ${variant}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" />${liveDot}</svg>`;
}

function scrollToQuantSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}
window.scrollToQuantSection = scrollToQuantSection;

function renderQuantInlineNav() {
  const nav = document.getElementById("quantInlineLinks");
  if (nav) nav.innerHTML = ""; // no section links in IG layout
}

const IG_POST_GRADIENTS = [
  "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
  "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
  "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  "linear-gradient(135deg, #94a3b8 0%, #334155 100%)"
];

const IG_HIGHLIGHTS = [
  { label: "GAIN",         icon: "🏢" },
  { label: "QuantPilot",   icon: "📊" },
  { label: "Court Vision", icon: "🏀" },
  { label: "Health AI",    icon: "⚕️" },
  { label: "Skills",       icon: "⚙️" },
  { label: "About",        icon: "👤" }
];

function openIgPost(index) {
  const project = PROJECTS[index];
  if (!project) return;

  const modal = document.getElementById("igPostModal");
  const inner = document.getElementById("igModalInner");
  if (!modal || !inner) return;

  const gradient = IG_POST_GRADIENTS[index % IG_POST_GRADIENTS.length];
  const statusClass = project.status.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const bulletsHtml = (project.bullets || []).map((b) => `<li>${b}</li>`).join("");
  const techHtml = (project.tech || []).map((t) => `<span>${t}</span>`).join("");

  inner.innerHTML = `
    <div class="ig-modal-left">
      <div class="ig-post-img" style="background:${gradient}">
        <div class="ig-post-name" style="position:relative;bottom:auto;left:auto;right:auto;padding:0;background:none;font-size:1.3rem;text-align:center;">${project.title}</div>
      </div>
    </div>
    <div class="ig-modal-right">
      <div class="ig-modal-header">
        <div class="ig-mini-avatar">EH</div>
        <span class="ig-modal-username">eric.hurchey</span>
        <button class="ig-modal-close" onclick="closeIgPost()">×</button>
      </div>
      <div class="ig-modal-body">
        <div class="ig-modal-caption">
          <strong>eric.hurchey</strong>
          <span class="ig-modal-status ${statusClass}">${project.status}</span>
          <p>${project.description}</p>
        </div>
        <ul class="ig-modal-bullets">${bulletsHtml}</ul>
        <div class="ig-modal-tech">${techHtml}</div>
      </div>
      <div class="ig-modal-actions">
        <button class="ig-action-btn" onclick="this.classList.toggle('liked')" title="Like">♥</button>
        <button class="ig-action-btn" title="Save">🔖</button>
        <a class="ig-view-btn" href="${project.link}" target="_blank" rel="noreferrer">View Repository</a>
      </div>
    </div>
  `;

  modal.classList.add("open");
  document.addEventListener("keydown", igEscapeHandler);
}

function closeIgPost() {
  const modal = document.getElementById("igPostModal");
  if (modal) modal.classList.remove("open");
  document.removeEventListener("keydown", igEscapeHandler);
}

function igEscapeHandler(e) {
  if (e.key === "Escape") closeIgPost();
}

window.openIgPost = openIgPost;
window.closeIgPost = closeIgPost;

function renderQuantInline() {
  const app = document.getElementById("quantInlineApp");
  if (!app) return;

  renderQuantInlineNav();

  const highlightsHtml = IG_HIGHLIGHTS.map((h) => `
    <div class="ig-highlight">
      <div class="ig-highlight-ring">
        <div class="ig-highlight-inner">${h.icon}</div>
      </div>
      <span class="ig-highlight-label">${h.label}</span>
    </div>
  `).join("");

  const postsHtml = PROJECTS.map((project, i) => `
    <div class="ig-post" onclick="openIgPost(${i})">
      <div class="ig-post-img" style="background:${IG_POST_GRADIENTS[i % IG_POST_GRADIENTS.length]}">
        <div class="ig-post-overlay">
          <span>♥ ${18 + i * 9}</span>
          <span>💬 ${3 + i * 2}</span>
        </div>
        <span class="ig-post-status">${project.status}</span>
        <div class="ig-post-name">${project.title}</div>
      </div>
    </div>
  `).join("");

  app.innerHTML = `
    <div class="ig-layout">

      <div class="ig-profile">
        <div class="ig-avatar-ring">
          <div class="ig-avatar">EH</div>
        </div>
        <div class="ig-profile-info">
          <div class="ig-username-row">
            <h2 class="ig-username">eric.hurchey</h2>
            <a class="ig-btn primary" href="${PROFILE.github}" target="_blank" rel="noreferrer">GitHub</a>
            <a class="ig-btn" href="${PROFILE.resumeUrl}" target="_blank" rel="noreferrer">Resume</a>
            <button class="ig-btn ghost" onclick="setMode('gui')">Visual Mode</button>
          </div>
          <div class="ig-stats">
            <div class="ig-stat"><strong>${PROJECTS.length}</strong><span>projects</span></div>
            <div class="ig-stat"><strong>${EXPERIENCE.length}</strong><span>roles</span></div>
            <div class="ig-stat"><strong>7+</strong><span>languages</span></div>
          </div>
          <div class="ig-bio">
            <strong>${PROFILE.name}</strong>
            <span class="ig-bio-muted">${PROFILE.role}</span>
            <span class="ig-bio-muted">${PROFILE.tagline}</span>
            <span class="ig-bio-muted">📍 ${PROFILE.location}</span>
            <a class="ig-link" href="${PROFILE.linkedin}" target="_blank" rel="noreferrer">linkedin.com/in/eric-hurchey</a>
          </div>
        </div>
      </div>

      <div class="ig-divider"></div>

      <div class="ig-highlights">${highlightsHtml}</div>

      <div class="ig-divider"></div>

      <div class="ig-tabs">
        <div class="ig-tab active">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
            <rect x="0" y="0" width="5.5" height="5.5"/>
            <rect x="7.5" y="0" width="5.5" height="5.5"/>
            <rect x="0" y="7.5" width="5.5" height="5.5"/>
            <rect x="7.5" y="7.5" width="5.5" height="5.5"/>
          </svg>
          Posts
        </div>
      </div>

      <div class="ig-posts-grid">${postsHtml}</div>

    </div>

    <div class="ig-modal" id="igPostModal" onclick="if(event.target===this)closeIgPost()">
      <div class="ig-modal-inner" id="igModalInner"></div>
    </div>
  `;

  // Init interactions after DOM is painted
  setTimeout(initQuantInteractions, 80);
}

let quantClockInterval = null;
function startQuantInlineClock() {
  const clock = document.getElementById("quantInlineClock");
  if (!clock) return;
  if (quantClockInterval) clearInterval(quantClockInterval);
  const update = () => { clock.textContent = new Date().toTimeString().split(" ")[0]; };
  update();
  quantClockInterval = setInterval(update, 1000);
}

/* ── Quant interactions ── */

let quantCanvasAnim = null;

function initQuantInteractions() {
  initQuantCanvas();
  initQuantScrollReveal();
  initQuantCardTilt();
  initQuantCursorGlow();
  initQuantMetricCountup();
}

function initQuantCanvas() {
  const canvas = document.getElementById("quantCanvas");
  if (!canvas) return;
  if (quantCanvasAnim) cancelAnimationFrame(quantCanvasAnim);

  const ctx = canvas.getContext("2d");
  let W = window.innerWidth, H = window.innerHeight;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = W * (window.devicePixelRatio || 1);
    canvas.height = H * (window.devicePixelRatio || 1);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }
  resize();
  window.addEventListener("resize", resize);

  // Data-stream columns: random numbers scrolling downward
  const COLS = 18;
  const colW = W / COLS;
  const DIGITS = "0123456789.+-";
  const cols = Array.from({ length: COLS }, (_, i) => ({
    x: i * colW + colW / 2,
    y: Math.random() * H,
    speed: Math.random() * 0.4 + 0.15,
    chars: Array.from({ length: 14 }, () => DIGITS[Math.floor(Math.random() * DIGITS.length)])
  }));

  // Faint grid
  const GRID = 60;

  function draw() {
    quantCanvasAnim = requestAnimationFrame(draw);
    if (currentMode !== "quant") return;
    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = "rgba(126, 255, 168, 0.028)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Scrolling data columns
    ctx.font = "10px 'Fira Code', monospace";
    cols.forEach(col => {
      col.y += col.speed;
      if (col.y > H + 200) col.y = -200;

      // Occasionally mutate a character
      if (Math.random() < 0.02) {
        const ci = Math.floor(Math.random() * col.chars.length);
        col.chars[ci] = DIGITS[Math.floor(Math.random() * DIGITS.length)];
      }

      col.chars.forEach((ch, i) => {
        const alpha = Math.max(0, 0.07 - i * 0.005);
        ctx.fillStyle = `rgba(126, 255, 168, ${alpha})`;
        ctx.fillText(ch, col.x, col.y + i * 14);
      });
    });

    // Faint diagonal signal lines
    const t = Date.now() * 0.00008;
    for (let s = 0; s < 3; s++) {
      const phase = t + s * 2.1;
      const x0 = (phase * 180) % (W + 400) - 200;
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.lineTo(x0 + 300, H);
      ctx.strokeStyle = `rgba(157, 199, 255, 0.025)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  draw();
}

function initQuantScrollReveal() {
  const targets = document.querySelectorAll(
    ".quant-panel, .section-head, .book-card, .research-card, .ledger-row"
  );
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("q-revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

function initQuantCardTilt() {
  const panels = document.querySelectorAll(".quant-panel");

  document.addEventListener("mousemove", (e) => {
    if (currentMode !== "quant") return;
    panels.forEach(panel => {
      const rect = panel.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top  && e.clientY <= rect.bottom;
      if (inside) {
        const rx = ((e.clientY - rect.top  - rect.height / 2) / rect.height) * -5;
        const ry = ((e.clientX - rect.left - rect.width  / 2) / rect.width ) *  6;
        panel.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      } else if (panel.style.transform) {
        panel.style.transform = "";
      }
    });
  });

  document.addEventListener("mouseleave", () => {
    if (currentMode !== "quant") return;
    panels.forEach(p => { p.style.transform = ""; });
  });
}

function initQuantCursorGlow() {
  const glow = document.getElementById("quantCursorGlow");
  if (!glow) return;
  document.addEventListener("mousemove", e => {
    if (currentMode !== "quant") return;
    glow.style.left = e.clientX + "px";
    glow.style.top  = e.clientY + "px";
  });
}

function initQuantMetricCountup() {
  const cards = document.querySelectorAll(".metric-card");
  cards.forEach(card => {
    const strong = card.querySelector("strong");
    if (!strong) return;
    const raw = strong.textContent.trim();
    // Only animate pure words, not numbers — skip things like "QuantPilot"
    const numMatch = raw.match(/^(\D*)(\d+)(\D*)$/);
    if (!numMatch) return;

    const prefix = numMatch[1], num = parseInt(numMatch[2], 10), suffix = numMatch[3];
    if (isNaN(num) || num > 9999) return;

    strong.textContent = prefix + "0" + suffix;
    card.classList.add("counting");

    const duration = 900, steps = 40;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const val = Math.round((step / steps) * num);
      strong.textContent = prefix + val + suffix;
      if (step >= steps) {
        strong.textContent = prefix + num + suffix;
        card.classList.remove("counting");
        clearInterval(interval);
      }
    }, duration / steps);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  renderQuickCommands();
  renderGuiSections();

  // Use simple show for initial render (no animation needed)
  document.querySelectorAll(".gui-section").forEach((s) => s.classList.remove("active"));
  const homeSection = document.getElementById("gui-home");
  if (homeSection) {
    homeSection.classList.add("active");
    updateActiveNav("home");
  }

  terminalSystem = new TerminalPortfolio();
  window.terminalSystem = terminalSystem;

  setMode("gui");
  initGuiInteractions();

  // Initialize skill linking and holographic cards after sections are rendered
  setTimeout(() => {
    initSkillProjectLinking();
    initHolographicCards();
  }, 100);
});

function exitHackMode() {
  if (terminalSystem) terminalSystem.hackGame.exit();
}
window.exitHackMode = exitHackMode;

/* ── GUI interactive effects ── */

let mouseX = 0;
let mouseY = 0;
let particleSystem = null;
let activeSkillFilter = null;
let sectionTransitioning = false;

function initGuiInteractions() {
  const cursorGlow = document.getElementById("guiCursorGlow");

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (currentMode !== "gui") return;

    if (cursorGlow) {
      cursorGlow.style.left = e.clientX + "px";
      cursorGlow.style.top = e.clientY + "px";
    }
  });

  // 3D card tilt on hover
  document.addEventListener("mousemove", (e) => {
    if (currentMode !== "gui") return;
    const cards = document.querySelectorAll(".gui-card, .gui-project-card, .timeline-content, .project-rail-card, .focus-panel");
    cards.forEach((card) => {
      if (card.classList.contains("tech-dimmed")) return;
      const rect = card.getBoundingClientRect();
      const isHovered = (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      );
      if (isHovered) {
        const xCenter = rect.left + rect.width / 2;
        const yCenter = rect.top + rect.height / 2;
        const rotateY = ((e.clientX - xCenter) / rect.width) * 8;
        const rotateX = ((yCenter - e.clientY) / rect.height) * 6;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      } else {
        card.style.transform = "";
      }
    });
  });

  document.addEventListener("mouseleave", () => {
    document.querySelectorAll(".gui-card, .gui-project-card, .timeline-content, .project-rail-card, .focus-panel").forEach((card) => {
      card.style.transform = "";
    });
  });

  initMagneticButtons();
  initParticleNetwork();
  initCustomCursor();
  initClickPulses();
}

/* ── Particle constellation network ── */

function initParticleNetwork() {
  const canvas = document.getElementById("particleCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const particles = [];
  const PARTICLE_COUNT = 80;
  const CONNECTION_DISTANCE = 150;
  const MOUSE_RADIUS = 200;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let animId = null;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * (window.devicePixelRatio || 1);
    canvas.height = height * (window.devicePixelRatio || 1);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  resize();
  window.addEventListener("resize", resize);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
      baseAlpha: Math.random() * 0.4 + 0.2
    });
  }

  // Ambient floating code characters
  const CODE_TOKENS = ["01", "1", "0", "//", "{}", "[]", "=>", "!=", "&&", ">>", "<<", "0x", "ff", "null", ";"];
  const codeChars = [];
  for (let i = 0; i < 22; i++) {
    codeChars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vy: -(Math.random() * 0.25 + 0.08),
      token: CODE_TOKENS[Math.floor(Math.random() * CODE_TOKENS.length)],
      alpha: Math.random() * 0.09 + 0.03,
      size: Math.floor(Math.random() * 3) + 9
    });
  }

  function animate() {
    animId = requestAnimationFrame(animate);
    if (currentMode !== "gui") return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Mouse repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.8;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Dampen velocity
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Clamp speed
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 2) {
        p.vx = (p.vx / speed) * 2;
        p.vy = (p.vy / speed) * 2;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // Draw particle
      const alpha = p.baseAlpha + (dist < MOUSE_RADIUS ? (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.3 : 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    // Draw ambient code tokens
    ctx.save();
    ctx.font = "9px 'Fira Code', monospace";
    codeChars.forEach((c) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;
      ctx.fillText(c.token, c.x, c.y);
      c.y += c.vy;
      if (c.y < -20) {
        c.y = height + 20;
        c.x = Math.random() * width;
        c.token = CODE_TOKENS[Math.floor(Math.random() * CODE_TOKENS.length)];
      }
    });
    ctx.restore();

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;

          // Brighter lines near mouse
          const midX = (particles[i].x + particles[j].x) / 2;
          const midY = (particles[i].y + particles[j].y) / 2;
          const mouseDist = Math.sqrt((midX - mouseX) ** 2 + (midY - mouseY) ** 2);
          const mouseBoost = mouseDist < MOUSE_RADIUS ? (MOUSE_RADIUS - mouseDist) / MOUSE_RADIUS * 0.2 : 0;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity + mouseBoost})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  animate();

  particleSystem = {
    destroy() {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    }
  };
}

/* ── Mouse-reactive 3D shapes ── */

const originalAnimate3D = null;

function init3DBackgroundWithMouseReactivity() {
  if (!renderer3d || !shapes3d.length) return;

  // Mouse reactivity is handled in the existing animate loop
  // We just need to override the animation to include mouse influence
}

/* ── Text scramble/decode effect ── */

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function scrambleText(element) {
  if (!element || element.dataset.scrambled === "true") return;
  element.dataset.scrambled = "true";

  const originalText = element.textContent;
  const length = originalText.length;
  let frame = 0;
  const totalFrames = length + 20;

  function update() {
    let output = "";
    for (let i = 0; i < length; i++) {
      if (originalText[i] === " ") {
        output += " ";
        continue;
      }
      const revealPoint = (i / length) * (totalFrames - 10);
      if (frame >= revealPoint) {
        output += originalText[i];
      } else {
        output += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    element.textContent = output;
    frame++;

    if (frame < totalFrames) {
      requestAnimationFrame(update);
    } else {
      element.textContent = originalText;
    }
  }

  update();
}

function triggerScrambleOnVisible() {
  const titles = document.querySelectorAll(".gui-section.active .gui-section-title, .gui-section.active .gui-hero h1");
  titles.forEach((title) => scrambleText(title));
}

/* ── Skill-project cross-linking ── */

function initSkillProjectLinking() {
  document.querySelectorAll(".skill-chip").forEach((chip) => {
    chip.classList.add("interactive");
    chip.addEventListener("click", () => {
      const skill = chip.textContent.trim().toLowerCase();

      if (activeSkillFilter === skill) {
        clearSkillFilter();
        return;
      }

      activeSkillFilter = skill;

      // Update chip states
      document.querySelectorAll(".skill-chip").forEach((c) => {
        c.classList.remove("active-filter");
      });
      chip.classList.add("active-filter");

      // Navigate to projects section and highlight
      showGuiSection("projects");
      setTimeout(() => highlightProjectsBySkill(skill), 100);
    });
  });
}

function highlightProjectsBySkill(skill) {
  const projectCards = document.querySelectorAll(".gui-project-card");
  projectCards.forEach((card) => {
    const techTags = card.querySelectorAll(".tech-tag");
    let hasMatch = false;
    techTags.forEach((tag) => {
      const tagText = tag.textContent.trim().toLowerCase();
      if (tagText === skill || tagText.includes(skill) || skill.includes(tagText)) {
        hasMatch = true;
        tag.classList.add("tech-match");
      } else {
        tag.classList.remove("tech-match");
      }
    });

    if (hasMatch) {
      card.classList.remove("tech-dimmed");
      card.classList.add("tech-highlighted");
    } else {
      card.classList.add("tech-dimmed");
      card.classList.remove("tech-highlighted");
    }
  });

  // Add a clear filter button if not already present
  const section = document.getElementById("gui-projects");
  if (section && !section.querySelector(".clear-filter-btn")) {
    const shell = section.querySelector(".gui-shell");
    if (shell) {
      const btn = document.createElement("button");
      btn.className = "gui-button clear-filter-btn";
      btn.textContent = `Showing: ${skill} — Click to clear`;
      btn.style.marginBottom = "20px";
      btn.onclick = clearSkillFilter;
      const header = shell.querySelector(".section-header");
      if (header) header.after(btn);
    }
  }
}

function clearSkillFilter() {
  activeSkillFilter = null;
  document.querySelectorAll(".skill-chip").forEach((c) => c.classList.remove("active-filter"));
  document.querySelectorAll(".gui-project-card").forEach((card) => {
    card.classList.remove("tech-dimmed", "tech-highlighted");
    card.querySelectorAll(".tech-tag").forEach((tag) => tag.classList.remove("tech-match"));
  });
  document.querySelectorAll(".clear-filter-btn").forEach((btn) => btn.remove());
}

/* ── Magnetic button hover effect ── */

function initMagneticButtons() {
  const handleMagnetic = (e) => {
    if (currentMode !== "gui") return;
    const buttons = document.querySelectorAll(".gui-button, .project-link, .gui-back-btn, .gui-mode-toggle, .gui-nav-link");
    buttons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      const bx = rect.left + rect.width / 2;
      const by = rect.top + rect.height / 2;
      const dx = e.clientX - bx;
      const dy = e.clientY - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = 80;

      if (dist < threshold) {
        const pull = (threshold - dist) / threshold;
        const moveX = dx * pull * 0.3;
        const moveY = dy * pull * 0.3;
        btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        btn.classList.add("magnetic");
      } else if (btn.classList.contains("magnetic")) {
        btn.style.transform = "";
        btn.classList.remove("magnetic");
      }
    });
  };

  document.addEventListener("mousemove", handleMagnetic);
}

/* ── Smooth section transitions ── */

const originalShowGuiSection = showGuiSection;

function showGuiSectionAnimated(sectionId) {
  if (sectionTransitioning) return;

  const currentSection = document.querySelector(".gui-section.active");
  const targetSection = document.getElementById(`gui-${sectionId}`);

  if (!targetSection || currentSection === targetSection) return;

  sectionTransitioning = true;

  if (currentSection) {
    currentSection.classList.remove("active");
    currentSection.classList.add("section-exit");

    // Fire CRT static flash mid-exit
    setTimeout(() => showStaticFlash(), 110);

    setTimeout(() => {
      currentSection.classList.remove("section-exit");
      currentSection.style.display = "";

      targetSection.classList.add("active", "section-enter");
      updateActiveNav(sectionId);
      window.scrollTo(0, 0);

      setTimeout(() => {
        targetSection.classList.remove("section-enter");
        triggerScrambleOnVisible();
        initHolographicCards();
        sectionTransitioning = false;

        if (sectionId === "skills") {
          setTimeout(initSkillProjectLinking, 50);
        }
      }, 450);
    }, 300);
  } else {
    targetSection.classList.add("active", "section-enter");
    updateActiveNav(sectionId);
    window.scrollTo(0, 0);
    setTimeout(() => {
      targetSection.classList.remove("section-enter");
      triggerScrambleOnVisible();
      initHolographicCards();
      sectionTransitioning = false;
    }, 450);
  }
}

// Override showGuiSection with the animated version
showGuiSection = function(sectionId) {
  if (currentMode === "gui") {
    showGuiSectionAnimated(sectionId);
  } else {
    // Non-gui mode: use simple swap
    document.querySelectorAll(".gui-section").forEach((section) => section.classList.remove("active"));
    const target = document.getElementById(`gui-${sectionId}`);
    if (target) {
      target.classList.add("active");
      updateActiveNav(sectionId);
      window.scrollTo(0, 0);
    }
  }
};
window.showGuiSection = showGuiSection;

/* ── Custom animated cursor ── */

function initCustomCursor() {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;

  const TRAIL_COUNT = 7;
  const trail = [];

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const el = document.createElement("div");
    el.className = "cursor-trail-dot";
    const size = Math.max(1.2, 5 - i * 0.52);
    const alpha = Math.max(0.04, 0.38 - i * 0.048);
    el.style.cssText = `width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;background:rgba(255,255,255,${alpha});`;
    document.body.appendChild(el);
    trail.push({ el, x: -200, y: -200 });
  }

  let dotX = -200, dotY = -200;
  let ringX = -200, ringY = -200;

  document.addEventListener("mousemove", (e) => {
    dotX = e.clientX;
    dotY = e.clientY;
  });

  (function loop() {
    requestAnimationFrame(loop);
    if (currentMode !== "gui") return;

    dot.style.transform = `translate(${dotX}px,${dotY}px)`;

    ringX += (dotX - ringX) * 0.1;
    ringY += (dotY - ringY) * 0.1;
    ring.style.transform = `translate(${ringX}px,${ringY}px)`;

    trail[0].x += (dotX - trail[0].x) * 0.42;
    trail[0].y += (dotY - trail[0].y) * 0.42;
    trail[0].el.style.transform = `translate(${trail[0].x}px,${trail[0].y}px)`;

    for (let i = 1; i < trail.length; i++) {
      const lag = Math.max(0.06, 0.28 - i * 0.022);
      trail[i].x += (trail[i - 1].x - trail[i].x) * lag;
      trail[i].y += (trail[i - 1].y - trail[i].y) * lag;
      trail[i].el.style.transform = `translate(${trail[i].x}px,${trail[i].y}px)`;
    }
  })();

  document.addEventListener("mousedown", () => {
    if (currentMode !== "gui") return;
    dot.classList.add("clicking");
    ring.classList.add("clicking");
  });
  document.addEventListener("mouseup", () => {
    dot.classList.remove("clicking");
    ring.classList.remove("clicking");
  });
  document.addEventListener("mouseover", (e) => {
    if (currentMode !== "gui") return;
    if (e.target.closest("a, button")) {
      ring.classList.add("hovering");
    } else {
      ring.classList.remove("hovering");
    }
  });
}

/* ── Click shockwave pulse ── */

function initClickPulses() {
  document.addEventListener("click", (e) => {
    if (currentMode !== "gui") return;
    spawnPulse(e.clientX, e.clientY, false);
    setTimeout(() => spawnPulse(e.clientX, e.clientY, true), 65);
  });
}

function spawnPulse(x, y, secondary) {
  const el = document.createElement("div");
  el.className = "click-pulse" + (secondary ? " secondary" : "");
  el.style.left = x + "px";
  el.style.top = y + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), secondary ? 1200 : 800);
}

/* ── Holographic foil shimmer on cards ── */

function initHolographicCards() {
  document.querySelectorAll(".gui-project-card, .now-card").forEach((card) => {
    if (card.querySelector(".card-holographic")) return;

    const shimmer = document.createElement("div");
    shimmer.className = "card-holographic";
    card.appendChild(shimmer);

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI) + 180;
      shimmer.style.setProperty("--hx", x);
      shimmer.style.setProperty("--hy", y);
      shimmer.style.setProperty("--hangle", `${angle}deg`);
      shimmer.style.opacity = "1";
    });

    card.addEventListener("mouseleave", () => {
      shimmer.style.opacity = "0";
    });
  });
}

/* ── CRT static flash between section transitions ── */

function showStaticFlash() {
  const overlay = document.getElementById("staticOverlay");
  if (!overlay) return;

  const W = 280, H = 158;
  overlay.width = W;
  overlay.height = H;
  const ctx = overlay.getContext("2d");
  overlay.style.display = "block";

  let frame = 0;
  const TOTAL = 12;

  (function tick() {
    const img = ctx.createImageData(W, H);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const on = Math.random() > 0.42;
      const v = on ? Math.floor(Math.random() * 220 + 35) : 0;
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    const t = frame / TOTAL;
    overlay.style.opacity = String(Math.sin(t * Math.PI) * 0.28);
    frame++;

    if (frame < TOTAL) {
      requestAnimationFrame(tick);
    } else {
      overlay.style.opacity = "0";
      overlay.style.display = "none";
    }
  })();
}
