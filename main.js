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

let currentMode = "terminal";
let terminalSystem = null;
let quickCommandsVisible = false;
let firstVisit = !localStorage.getItem("portfolioVisited");
let scene3d = null;
let camera3d = null;
let renderer3d = null;
let shapes3d = [];
let animationId3d = null;

applyMeta();

setTimeout(() => {
  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) loadingScreen.classList.add("hidden");
  if (firstVisit) localStorage.setItem("portfolioVisited", "true");
}, 1100);

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
        return `<a class="gui-button ${variantClass}" href="${button.target}" target="_blank" rel="noreferrer">${button.label}</a>`;
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

  const contactLinks = (CONTACT.methods || [])
    .map(
      (item) => `<a class="gui-button" href="${item.href}" target="${item.href.startsWith("mailto:") ? "_self" : "_blank"}" rel="noreferrer">${item.label}</a>`
    )
    .join("");

  section.innerHTML = `
    <div class="gui-shell gui-home-shell">
      <section class="gui-hero">
        <div class="gui-hero-copy" style="max-width: 800px;">
          <p class="section-kicker">${PROFILE.role} // ${PROFILE.location}</p>
          <h1>${PROFILE.name}</h1>
          <p class="gui-hero-tagline">${PROFILE.tagline}</p>
          <div class="gui-stats-row">${stats}</div>
          <div class="gui-hero-buttons">
            <a class="gui-button primary" href="${PROFILE.resumeUrl}" target="_blank" rel="noreferrer">Resume</a>
            <a class="gui-button" href="${PROFILE.github}" target="_blank" rel="noreferrer">GitHub</a>
            <a class="gui-button" href="${PROFILE.linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>
            <button class="gui-button" onclick="setMode('terminal')">Terminal Mode</button>
          </div>
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
    "RIGHT NOW",
    "What is current",
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
    "How I like to build",
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
    "Technical stack",
    "The tools I use to build, debug, and iterate.",
    `<div class="gui-grid">${cards}</div>`
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
    "Things I am building or have finished",
    "Practical problems, clear user value, and learning by building.",
    `<div class="gui-grid project-grid">${cards}</div>`
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
    "Recent roles and context",
    "Practical engineering, communication, and learning by doing.",
    `<div class="gui-timeline">${timeline}</div>`
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
    "Reach out",
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
    body.classList.add("gui-mode");
    showGuiSection("home");
    window.scrollTo(0, 0);
    init3DBackground();
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

  destroy3DBackground();
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
window.showGuiSection = showGuiSection;

function init3DBackground() {
  const canvas = document.getElementById("canvas3d");
  if (!canvas || renderer3d || !window.THREE) return;

  scene3d = new window.THREE.Scene();
  camera3d = new window.THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer3d = new window.THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer3d.setSize(window.innerWidth, window.innerHeight);
  renderer3d.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer3d.setClearColor(0x000000, 0);

  const geometries = [
    new window.THREE.TetrahedronGeometry(1.4),
    new window.THREE.OctahedronGeometry(1.2),
    new window.THREE.IcosahedronGeometry(1.1)
  ];

  const materials = [
    new window.THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.12 }),
    new window.THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true, transparent: true, opacity: 0.06 })
  ];

  shapes3d = [];
  for (let index = 0; index < 6; index += 1) {
    const geometry = geometries[index % geometries.length];
    const material = materials[index % materials.length];
    const mesh = new window.THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 13;
    mesh.position.y = (Math.random() - 0.5) * 9;
    mesh.position.z = (Math.random() - 0.5) * 10;
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    shapes3d.push(mesh);
    scene3d.add(mesh);
  }

  camera3d.position.z = 7;

  const animate3D = () => {
    animationId3d = requestAnimationFrame(animate3D);
    shapes3d.forEach((shape, index) => {
      shape.rotation.x += 0.001 * (index + 1);
      shape.rotation.y += 0.0009 * (index + 1);
      shape.position.y += Math.sin(Date.now() * 0.00035 + index) * 0.0012;
      shape.position.x += Math.cos(Date.now() * 0.0002 + index) * 0.0007;
    });
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
    this.level = 1;
    this.active = false;
    this.isTyping = false;
    this.levels = {
      1: {
        title: "LEVEL 1: THE WARM-UP",
        question: 'What year did Jeremy Lin create "Linsanity" in the NBA?',
        answer: "2012",
        hint: "It happened in February between 2010 and 2015."
      },
      2: {
        title: "LEVEL 2: SIMPLE MATH",
        question: "What is 21 + 21?",
        answer: "42",
        hint: "The answer to life, the universe, and everything."
      },
      3: {
        title: "LEVEL 3: TECH TRIVIA",
        question: "Complete this: HTML, CSS, and _____?",
        answer: "javascript",
        hint: "The language that makes the web come alive."
      },
      4: {
        title: "LEVEL 4: PATTERN RECOGNITION",
        question: "What comes next: 2, 4, 6, 8, ___?",
        answer: "10",
        hint: "Count by twos."
      },
      5: {
        title: "FINAL LEVEL: THE PASSWORD",
        question: 'Type the magic word: "please"',
        answer: "please",
        hint: "Manners matter."
      }
    };
  }

  open() {
    this.active = true;
    this.level = 1;
    this.setTyping(false);
    this.output.innerHTML = "";
    this.input.value = "";
    this.container.classList.add("active");
    this.bindEvents();
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

  startLevel(level) {
    const data = this.levels[level];
    if (!data) {
      this.victory();
      return;
    }

    this.level = level;
    this.typeLines([
      { text: "", className: "" },
      { text: "--------------------------------------------------", className: "hack-section" },
      { text: data.title, className: "hack-section" },
      { text: "--------------------------------------------------", className: "hack-section" },
      { text: data.question, className: "hack-warning" },
      { text: 'Type "answer <your_answer>" to submit', className: "hack-info" }
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

    if (command === "skip") {
      this.typeLines([{ text: "Skipping level...", className: "hack-info" }]).then(() => this.startLevel(this.level + 1));
      return;
    }

    if (command === "answer") {
      if (!answer) {
        this.typeLine("Usage: answer <your_answer>", "hack-error");
        return;
      }

      const level = this.levels[this.level];
      if (answer.toLowerCase() === level.answer.toLowerCase()) {
        this.typeLines([
          { text: "[SUCCESS] Correct answer!", className: "hack-success" },
          { text: "Advancing...", className: "hack-info" }
        ]).then(() => this.startLevel(this.level + 1));
        return;
      }

      this.typeLines([
        { text: "[FAILED] Wrong answer. Try again!", className: "hack-error" },
        { text: 'Type "hint" if you are stuck.', className: "hack-warning" }
      ]);
      return;
    }

    this.typeLine("Unknown command. Try: answer, hint, skip, exit", "hack-error");
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
      { text: "Secret message: keep learning, keep growing.", className: "hack-warning" },
      { text: "Closing in 3 seconds...", className: "hack-info" }
    ]);
    setTimeout(() => this.exit(), 3000);
  }

  exit() {
    this.active = false;
    this.setTyping(false);
    this.container.classList.remove("active");
    this.output.innerHTML = "";
    this.input.value = "";
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
    this.hackGame = new HackGame();
    this.fileSystem = this.buildFileSystem();
    this.commands = this.buildCommands();
    this.init();
  }

  init() {
    this.setupEvents();
    this.showWelcomeMessage();
    this.startClock();
    this.updatePrompt();
    this.updateCursorPosition();
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
        "PROJECT INDEX",
        "=============",
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
    this.input.addEventListener("keydown", (event) => this.handleKeyPress(event));
    this.input.addEventListener("input", () => this.updateCursorPosition());
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
      this.executeCommand();
    } else if (event.key === "Tab") {
      event.preventDefault();
      quickCommandsVisible ? hideQuickCommands() : showQuickCommands();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      this.navigateHistory(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
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
    const bigName = [
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
    ].join("\n");

    const container = document.createElement("div");
    container.className = "ascii-art-container";

    const pre = document.createElement("pre");
    pre.className = "ascii-art";
    pre.textContent = bigName;

    container.appendChild(pre);
    this.output.appendChild(container);

    const tagline = document.createElement("div");
    tagline.className = "ascii-art-container";
    const tagPre = document.createElement("pre");
    tagPre.className = "ascii-art ascii-tagline";
    tagPre.textContent = "SOFTWARE ENGINEER // TERMINAL PORTFOLIO";
    tagline.appendChild(tagPre);
    this.output.appendChild(tagline);
    this.addOutput("", "");
    this.addOutput('Welcome. Type "help" or press Tab for quick commands.', "success");
    this.addOutput("Current signal: Software Engineer Intern at GAIN.", "info");
    this.addOutput('Try "now", "ls", "gui", or "cat ~/projects/README.md".', "info");
    this.addOutput("", "");
    this.scrollToBottom();
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
    this.addOutput("  red pill | blue pill", "warning");
    this.addOutput("  knicks | violin | linsanity", "warning");
    this.addOutput("", "");
    this.scrollToBottom();
  }

  clearTerminal() {
    this.output.innerHTML = "";
    this.currentPath = "~";
    this.matrixUnlocked = false;
    this.updatePrompt();
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
    this.addOutput("Switching to quant mode...", "info");
    setTimeout(() => setMode("quant"), 300);
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
    this.addOutput("", "");
    this.addOutput("ENTERING THE MATRIX...", "success");
    this.matrixUnlocked = true;

    const matrixChars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ0123456789";
    for (let i = 0; i < 2; i += 1) {
      let rain = "";
      for (let row = 0; row < 8; row += 1) {
        let line = "";
        for (let column = 0; column < 50; column += 1) {
          line += Math.random() > 0.3 ? matrixChars[Math.floor(Math.random() * matrixChars.length)] : " ";
        }
        rain += `${line}\n`;
      }
      this.addHTML(`<pre class="matrix-block" style="opacity: ${1 - i * 0.3};">${rain}</pre>`);
    }

    this.addOutput('Type "red pill" or "blue pill" to choose your path.', "warning");
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
      this.scrollToBottom();
    }, 400);
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
  const pts = values.map((v, i) => {
    const y = max === min ? h / 2 : h - ((v - min) / (max - min)) * (h - 14) - 7;
    return `${i * step},${y}`;
  }).join(" ");
  return `<svg class="sparkline ${variant}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" /></svg>`;
}

function renderQuantInlineNav() {
  const nav = document.getElementById("quantInlineLinks");
  if (!nav) return;
  nav.innerHTML = (QUANT_SITE.navigation || [])
    .map((item) => `<a href="#quant-${item.id}">${item.label}</a>`)
    .join("");
}

function renderQuantInline() {
  const app = document.getElementById("quantInlineApp");
  if (!app) return;

  renderQuantInlineNav();

  const hero = QUANT_SITE.hero || {};
  const metrics = (hero.metrics || []).map((m) => `<div class="metric-card"><span class="metric-label">${m.label}</span><strong>${m.value}</strong></div>`).join("");
  const notes = (hero.notes || []).map((n) => `<div class="note-row">${n}</div>`).join("");
  const tape = [...(hero.tape || []), ...(hero.tape || [])].map((item, i) => `<span class="ticker-item">${String(i + 1).padStart(2, "0")} ${item}</span>`).join("");

  const researchCards = (QUANT_SITE.research || []).map((item) => `
    <article class="quant-panel research-card">
      <p class="quant-kicker">THESIS</p>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </article>
  `).join("");

  const processItems = (QUANT_SITE.process || []).map((item) => `<li>${item}</li>`).join("");
  const focusRows = (QUANT_SITE.focusBoard || []).map((item) => `<div class="focus-board-row"><span>${item.label}</span><strong>${item.value}</strong></div>`).join("");

  const projectCards = PROJECTS.map((project, i) => `
    <article class="quant-panel book-card">
      <div class="book-card-header">
        <span class="book-index">${String(i + 1).padStart(2, "0")}</span>
        <span class="book-status ${project.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${project.status}</span>
      </div>
      <h3>${project.title}</h3>
      <p class="book-badge">${project.badge}</p>
      <p class="book-summary">${project.summary}</p>
      <div class="book-tags">${(project.tech || []).map((t) => `<span>${t}</span>`).join("")}</div>
      <div class="book-actions">
        <a class="quant-button primary" href="${project.link}" target="_blank" rel="noreferrer">Repository</a>
      </div>
    </article>
  `).join("");

  const expRows = EXPERIENCE.map((item) => `
    <div class="ledger-row">
      <span class="ledger-period">${item.dates}</span>
      <div><strong>${item.title}</strong><p>${item.company} · ${item.location}</p></div>
      <div class="ledger-signal"><p>${item.summary}</p><div class="ledger-tags">${(item.tech || []).map((t) => `<span>${t}</span>`).join("")}</div></div>
    </div>
  `).join("");

  const contactCards = (CONTACT.methods || []).map((item) => `
    <article class="quant-panel contact-card">
      <p class="quant-kicker">CHANNEL</p>
      <h3>${item.label}</h3>
      <a href="${item.href}" ${item.href.startsWith("mailto:") ? "" : 'target="_blank" rel="noreferrer"'}>${item.value}</a>
    </article>
  `).join("");

  app.innerHTML = `
    <section class="quant-section quant-hero-section" id="quant-overview">
      <div class="quant-hero-grid">
        <div class="quant-hero-copy quant-panel">
          <p class="quant-kicker">${hero.eyebrow || ""}</p>
          <h1>${hero.headline || ""}</h1>
          <p class="quant-summary">${hero.summary || ""}</p>
          <div class="quant-hero-actions">
            <a class="quant-button primary" href="${PROFILE.github}" target="_blank" rel="noreferrer">GitHub</a>
            <a class="quant-button" href="${PROFILE.resumeUrl}" target="_blank" rel="noreferrer">Resume</a>
            <button class="quant-button" onclick="setMode('terminal')">Terminal</button>
          </div>
          <div class="quant-notes">${notes}</div>
        </div>
        <aside class="quant-desk quant-panel">
          <div class="desk-header"><div><p class="quant-kicker">DESK SNAPSHOT</p><h2>Current board</h2></div><span class="desk-status">LIVE RESEARCH</span></div>
          <div class="metric-grid">${metrics}</div>
          <div class="curve-card">
            <div class="curve-header"><span>Research momentum</span><span>12-step view</span></div>
            ${quantSparkline(QUANT_CURVES.primary, "primary")}
            ${quantSparkline(QUANT_CURVES.secondary, "secondary")}
          </div>
        </aside>
      </div>
      <div class="ticker-shell"><div class="ticker-track">${tape}</div></div>
    </section>

    <section class="quant-section" id="quant-research">
      <div class="section-head"><p class="quant-kicker">RESEARCH STACK</p><h2>How I want the work to look</h2></div>
      <div class="research-grid">${researchCards}</div>
      <div class="board-grid">
        <div class="quant-panel process-panel"><p class="quant-kicker">PROCESS</p><h3>Operating rules</h3><ul class="process-list">${processItems}</ul></div>
        <div class="quant-panel focus-board"><p class="quant-kicker">FOCUS BOARD</p><h3>What is actually in motion</h3><div class="focus-board-grid">${focusRows}</div></div>
      </div>
    </section>

    <section class="quant-section" id="quant-projects">
      <div class="section-head"><p class="quant-kicker">TRADE BOOK</p><h2>Projects under review</h2></div>
      <div class="book-grid">${projectCards}</div>
    </section>

    <section class="quant-section" id="quant-experience">
      <div class="section-head"><p class="quant-kicker">TRACK RECORD</p><h2>Experience ledger</h2></div>
      <div class="ledger-table quant-panel">
        <div class="ledger-head ledger-row"><span>Period</span><span>Role</span><span>Signal</span></div>
        ${expRows}
      </div>
    </section>

    <section class="quant-section" id="quant-contact">
      <div class="section-head"><p class="quant-kicker">CONTACT</p><h2>Open channel</h2><p class="section-copy">${QUANT_SITE.contactLine || ""}</p></div>
      <div class="contact-grid">${contactCards}</div>
    </section>
  `;
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

document.addEventListener("DOMContentLoaded", () => {
  renderNav();
  renderQuickCommands();
  renderGuiSections();
  showGuiSection("home");

  terminalSystem = new TerminalPortfolio();
  window.terminalSystem = terminalSystem;
});

function exitHackMode() {
  if (terminalSystem) terminalSystem.hackGame.exit();
}
window.exitHackMode = exitHackMode;
