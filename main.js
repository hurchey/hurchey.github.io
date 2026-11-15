const PORTFOLIO = window.PORTFOLIO_CONTENT || {};
const META = PORTFOLIO.meta || {};
const PROFILE = PORTFOLIO.profile || {};
const NOW = PORTFOLIO.now || {};
const ABOUT = PORTFOLIO.about || {};
const SKILLS = PORTFOLIO.skills || [];
const PROJECTS = PORTFOLIO.projects || [];
const EXPERIENCE = PORTFOLIO.experience || [];
const EDUCATION = PORTFOLIO.education || [];
const CONTACT = PORTFOLIO.contact || {};
const QUICK_COMMANDS = PORTFOLIO.quickCommands || [];
const TERMINAL = PORTFOLIO.terminal || {};

let terminalSystem = null;
let quickCommandsVisible = false;

applyMeta();

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
    /(https?:\/\/[^\s<)]+)/g,
    '<a class="terminal-link" href="$1" target="_blank" rel="noreferrer">$1</a>'
  );
  return linkified.replace(/\n/g, "<br>");
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
        `${/github\.com/i.test(project.link || "") ? "Repo" : "Live"}: ${project.link}`
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
          (project) =>
            `- ${project.title} [${project.status}] - ${project.summary}\n  ${/github\.com/i.test(project.link || "") ? "Repo" : "Live"}: ${project.link}`
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
      ...(EXPERIENCE[0] && EXPERIENCE[0].companyUrl ? [`- ${EXPERIENCE[0].company}: ${EXPERIENCE[0].companyUrl}`] : [])
    ].join("\n");

    const currentContent = [
      "CURRENT SNAPSHOT",
      "================",
      "",
      ...(NOW.cards || []).flatMap((card) => [
        `${card.eyebrow}: ${card.title}`,
        card.body,
        ...(card.link ? [`Link: ${card.link.url}`] : []),
        ""
      ])
    ].join("\n").trim();

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

    const educationContent = [
      "EDUCATION",
      "=========",
      "",
      ...EDUCATION.map((edu) =>
        [
          `${edu.school} | ${edu.location || ""}`,
          `${edu.degree}${edu.honors ? ` (${edu.honors})` : ""}`,
          edu.dates || "",
          ...(edu.bullets || []).map((b) => `- ${b}`)
        ]
          .filter(Boolean)
          .join("\n")
      )
    ].join("\n\n");

    const contactLines = (CONTACT.methods || []).length
      ? CONTACT.methods.map((m) => `${m.label}: ${m.href && m.href.startsWith("http") ? m.href : m.value}`)
      : [
          `Email: ${PROFILE.email}`,
          `LinkedIn: ${PROFILE.linkedin}`,
          `GitHub: ${PROFILE.github}`
        ];

    const contactContent = ["CONTACT", "=======", "", ...contactLines].join("\n");

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
          education: {
            type: "directory",
            contents: {
              "summary.txt": { type: "file", content: educationContent }
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
      whoami: () => this.addOutput(`${PROFILE.name} | ${PROFILE.subtitle || PROFILE.role}`, "info"),
      date: () => this.addOutput(new Date().toString(), "info"),
      echo: (args) => this.addOutput(args.join(" "), "info"),
      now: () => this.readFile(["~/now/current.md"]),
      education: () => this.readFile(["~/education/summary.txt"]),
      contact: () => this.readFile(["~/contact.txt"]),
      resume: () => this.downloadFile(["resume"]),
      download: (args) => this.downloadFile(args),
      gui: () => this.openSimpleSite(),
      simple: () => this.openSimpleSite(),
      site: () => this.openSimpleSite(),
      trace: () => this.traceMatrix(),
      signal: () => this.matrixSignal(),
      "exit-matrix": () => this.exitMatrix(),
      find: (args) => this.findFiles(args),
      grep: (args) => this.grepFiles(args),
      history: () => this.showHistory(),
      exit: () => this.addOutput("Close the tab to exit.", "warning"),
      hack: () => this.startHackingGame(),
      robotics: () => this.openRoboticsLab(),
      lab: () => this.openRoboticsLab(),
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
      if (!hackActive && !event.target.closest(".quick-commands-bar") && !event.target.closest(".robotics-console")) {
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
      { text: TERMINAL.welcomeSignal || `Current signal: ${PROFILE.subtitle || PROFILE.role}`, cls: "info" },
      { text: 'Try "now", "ls", "gui" (simple HTML site), or "cat ~/projects/README.md".', cls: "info" }
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
    this.addOutput("  education          Show education summary", "info");
    this.addOutput("  contact            Show contact details", "info");
    this.addOutput("  download resume    Open resume PDF", "info");
    this.addOutput("  gui | simple       Open the simple HTML website", "info");
    this.addOutput("  find <pattern>     Find files by name", "info");
    this.addOutput("  grep <pattern>     Search inside files", "info");
    this.addOutput("  clear              Clear terminal", "info");
    this.addOutput("  hack               Launch hacking mini-game", "success");
    this.addOutput("  robotics           Open the autonomy lab tracking demo", "success");
    this.addOutput("  matrix             Matrix rain effect", "success");
    this.addOutput("  trace | signal | exit-matrix", "warning");
    this.addOutput("  red pill | blue pill", "warning");
    this.addOutput("  knicks | violin | linsanity", "warning");
    this.addOutput("", "");
    this.scrollToBottom();
  }

  clearTerminal() {
    if (window.RoboticsLab && window.RoboticsLab.isOpen()) window.RoboticsLab.close();
    this.output.innerHTML = "";
    this.currentPath = "~";
    this.matrixUnlocked = false;
    this.matrixMode = false;
    this.updatePrompt();
    if (this.ghostEl) this.ghostEl.textContent = "";
    this.showWelcomeMessage();
  }

  openRoboticsLab() {
    const lab = window.RoboticsLab;
    if (!lab) {
      this.addOutput("Autonomy lab failed to load.", "error");
      return;
    }
    if (lab.isOpen()) {
      this.addOutput("Autonomy lab is already open. Use CLOSE [X] or `clear` to dismiss it.", "warning");
    } else {
      this.addOutput("Booting autonomy lab: lidar + camera perception → two-axis motor control.", "success");
      this.addOutput("Tune gain and noise, or click the viewport to drop a manual target.", "info");
      lab.open(this.output, { onClose: () => this.focusInput() });
    }
    this.scrollToBottom();
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

  openSimpleSite() {
    this.addOutput("Opening simple HTML website...", "info");
    window.location.href = "simple.html";
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
      ...EXPERIENCE.slice(0, 2).map((item) => `node://experience/${slugify(item.company)}`),
      ...PROJECTS.slice(0, 2).map((item) => `node://projects/${slugify(item.title)}`),
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

    const topRole = EXPERIENCE[0];
    const topProject = PROJECTS[0];
    this.addOutput("", "");
    this.addOutput("SIGNAL REVEAL:", "section");
    if (topRole) {
      this.addOutput(`Current role: ${topRole.title} at ${topRole.company}`, "info");
    }
    if (topProject) {
      this.addOutput(`Featured build: ${topProject.title} — ${topProject.badge}`, "info");
      this.addOutput(`Fast path: cat ~/projects/${slugify(topProject.title)}.md`, "warning");
    }
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
    this.clearIdleLine();
    this.idleLine = document.createElement("div");
    this.idleLine.className = "output-line output-idle-prompt";
    this.idleLine.textContent = "▶ PRESS ANY KEY TO CONTINUE ◀";
    this.output.appendChild(this.idleLine);
    this.scrollToBottom();
  }

  clearIdleLine() {
    if (this.idleLine) {
      this.idleLine.remove();
      this.idleLine = null;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderQuickCommands();

  const loadingScreen = document.getElementById("loadingScreen");
  if (loadingScreen) setTimeout(() => loadingScreen.classList.add("hidden"), 950);

  terminalSystem = new TerminalPortfolio();
  window.terminalSystem = terminalSystem;
  terminalSystem.focusInput();
});

function exitHackMode() {
  if (terminalSystem) terminalSystem.hackGame.exit();
}
window.exitHackMode = exitHackMode;
