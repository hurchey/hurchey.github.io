// Global state
let currentMode = 'terminal';
let terminalSystem = null;
let quickCommandsVisible = false;
let firstVisit = !localStorage.getItem('portfolioVisited');
let scene3d;
let camera3d;
let renderer3d;
let shapes3d = [];
let animationId3d;

// Data
const PROJECTS = [
  {
    title: "Food Suggestion App (Wht's Ckin?)",
    badge: 'AI + Mobile',
    tech: ['Python', 'JavaScript', 'TypeScript', 'React Native', 'React.js', 'Hugging Face', 'MySQL'],
    summary:
      'Cross-platform mobile app that identifies food items from photos and suggests recipes around user goals.',
    bullets: [
      'Developed a cross-platform React Native app that recognizes food from user photos and suggests new recipes tuned to calorie goals or budget constraints.',
      'Integrated Hugging Face datasets for accurate ingredient recognition directly from photographs.',
      'Built a Python recommendation engine to generate creative, goal-oriented meal ideas based on preferences and pantry items.'
    ]
  },
  {
    title: 'Website Cloning',
    badge: 'LLM + Web',
    tech: ['Python', 'TypeScript', 'Next.js', 'FastAPI', 'Gemini LLM', 'Hyperbrowser'],
    summary:
      'AI-driven website cloner that turns any public URL into a componentized, clean HTML/CSS codebase.',
    bullets: [
      'Built an AI “Website Cloner” that scrapes DOM, CSS, and assets to produce 80% pixel-fidelity HTML/CSS, cutting rebuild time from hours to minutes.',
      'Created a Python/FastAPI service that uses Hyperbrowser to capture page structure and assets in under 3 seconds before piping data to Gemini.',
      'Used Gemini LLM for DOM-to-component translation, giving hands-on prompt-engineering experience and sparking deeper interest in generative AI.'
    ]
  },
  {
    title: 'Warehouse Robot',
    badge: 'Robotics & Automation',
    tech: ['Python', 'ROS', 'OpenCV', 'MQTT', 'React'],
    summary: 'Simulation and control stack replicating warehouse robot navigation, picking, and inventory updates.',
    bullets: [
      'Built a ROS-driven navigation loop with OpenCV-based perception to identify shelves, slots, and pick targets.',
      'Implemented path planning, obstacle avoidance, and task queues to mirror real warehouse pick/put-away flows.',
      'Synced robot events to a lightweight inventory service and React dashboard to track stock levels and task status in real time.'
    ]
  }
];

const SKILL_GROUPS = [
  {
    title: 'Programming Languages',
    items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'HTML/CSS', 'C', 'Go']
  },
  {
    title: 'Frameworks / Libraries',
    items: ['React', 'Next.js', 'React Native', 'Node.js/Express', 'FastAPI', 'Flask', 'Liquid', 'Vue']
  },
  {
    title: 'Data / Storage',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'AWS S3']
  },
  {
    title: 'Systems / Cloud',
    items: ['Linux/Unix', 'Docker', 'GitHub Actions', 'CI/CD', 'OAuth/JWT']
  },
  {
    title: 'Tools',
    items: ['Git/GitHub', 'Jira', 'Notion', 'VS Code', 'Bash/Zsh']
  }
];

const EXPERIENCES = [
  {
    title: 'Software Engineer Intern',
    company: 'myGenius',
    location: 'Remote',
    dates: 'Jan 2025 – May 2025',
    bullets: [
      'Engineered an AI-powered testing platform that converts academic PDFs into adaptive sample tests with NLP + ML.',
      'Partnered with backend teams to improve data integrity and real-time updates, raising user satisfaction by 25%.',
      'Built efficient PDF parsing with live previews, streamlining test creation for students and instructors.'
    ],
    tech: ['React', 'TypeScript', 'NLP', 'Machine Learning']
  },
  {
    title: 'Level II ITS Technician',
    company: 'Brandeis ITS Help Desk',
    location: 'Waltham, MA',
    dates: 'Aug 2023 – May 2025',
    bullets: [
      'Improved first-response on 250+ tickets by tightening intake flows and routing across Linux, macOS, and Windows.',
      'Documented triage guides and mentored technicians on escalation and RCA to reduce repeat tickets.',
      'Sharpened reliability by standardizing diagnostics and knowledge sharing.'
    ],
    tech: ['Linux', 'macOS', 'Windows', 'Support']
  },
  {
    title: 'Teaching Assistant',
    company: 'Brandeis University',
    location: 'Waltham, MA',
    dates: 'Mar 2023 – Jan 2024',
    bullets: ['Guided 100+ students in Python and Discrete Mathematics; led weekly recitations and mentoring.'],
    tech: ['Python', 'Education']
  },
  {
    title: 'Software Engineer Intern',
    company: 'Peachy',
    location: 'Remote, NY',
    dates: 'May 2023 – Sep 2023',
    bullets: [
      'Built dynamic product filtering and interactive user feedback features for 10,000+ daily shoppers.',
      'Automated migration workflows for Shopify merchants, reducing timelines by 35% with 99.9% data accuracy.'
    ],
    tech: ['React', 'Shopify', 'Node.js']
  },
  {
    title: 'Software Engineer',
    company: 'Branda',
    location: 'Waltham, MA',
    dates: 'Sep 2022 – May 2023',
    bullets: [
      'Maintained student-run campus mobile app; refactored React Native UI/navigation for accessibility and flow.',
      'Built Node.js/Express APIs and MongoDB schemas with validation, caching, and indexed queries.'
    ],
    tech: ['React Native', 'Node.js', 'MongoDB']
  }
];

// Loader
setTimeout(() => {
  document.getElementById('loadingScreen').classList.add('hidden');
  if (firstVisit) localStorage.setItem('portfolioVisited', 'true');
}, 1200);

// Mode switching
function setMode(mode) {
  currentMode = mode;
  const body = document.body;

  if (mode === 'gui') {
    body.classList.add('gui-mode');
    hideQuickCommands();
    showGuiSection('home');
    window.scrollTo(0, 0);
    init3DBackground();
  } else {
    body.classList.remove('gui-mode');
    if (renderer3d) {
      cancelAnimationFrame(animationId3d);
      renderer3d = null;
      shapes3d = [];
    }
    if (terminalSystem) terminalSystem.focusInput();
  }
}
window.setMode = setMode;

// GUI sections
function showGuiSection(sectionId) {
  document.querySelectorAll('.gui-section').forEach((section) => section.classList.remove('active'));
  const target = document.getElementById(`gui-${sectionId}`);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }
}
window.showGuiSection = showGuiSection;

// 3D background
function init3DBackground() {
  const canvas = document.getElementById('canvas3d');
  if (!canvas || renderer3d) return;

  scene3d = new THREE.Scene();
  camera3d = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer3d = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer3d.setSize(window.innerWidth, window.innerHeight);
  renderer3d.setClearColor(0xffffff, 0);

  const geometries = [new THREE.TetrahedronGeometry(1), new THREE.OctahedronGeometry(1), new THREE.IcosahedronGeometry(1)];
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.2 });

  for (let i = 0; i < 5; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (Math.random() - 0.5) * 10;
    mesh.position.y = (Math.random() - 0.5) * 10;
    mesh.position.z = (Math.random() - 0.5) * 10;
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    shapes3d.push(mesh);
    scene3d.add(mesh);
  }

  camera3d.position.z = 5;

  const animate3D = () => {
    animationId3d = requestAnimationFrame(animate3D);
    shapes3d.forEach((shape, i) => {
      shape.rotation.x += 0.001 * (i + 1);
      shape.rotation.y += 0.001 * (i + 1);
    });
    renderer3d.render(scene3d, camera3d);
  };
  animate3D();
}

// Quick commands
function showQuickCommands() {
  quickCommandsVisible = true;
  document.getElementById('quickCommandsBar').classList.add('visible');
  const terminalBody = document.querySelector('.terminal-body');
  if (terminalBody) terminalBody.style.paddingBottom = '220px';
}
window.showQuickCommands = showQuickCommands;

function hideQuickCommands() {
  quickCommandsVisible = false;
  document.getElementById('quickCommandsBar').classList.remove('visible');
  const terminalBody = document.querySelector('.terminal-body');
  if (terminalBody) terminalBody.style.paddingBottom = '0';
  if (terminalSystem) terminalSystem.focusInput();
}
window.hideQuickCommands = hideQuickCommands;

function executeQuickCommand(command) {
  if (!terminalSystem) return;
  hideQuickCommands();
  if (command.startsWith('cat ~/')) {
    const path = command.substring(6);
    const parts = path.split('/');
    if (parts.length > 1) {
      const dir = parts.slice(0, -1).join('/');
      const file = parts[parts.length - 1];
      if (terminalSystem.currentPath !== `~/${dir}`) {
        terminalSystem.runCommand('cd ~');
        terminalSystem.runCommand(`cd ${dir}`);
      }
      terminalSystem.runCommand(`cat ${file}`);
      return;
    }
  }
  terminalSystem.runCommand(command);
}
window.executeQuickCommand = executeQuickCommand;

// GUI render helpers
function renderGuiProjects() {
  const grid = document.querySelector('#gui-projects .gui-grid');
  if (!grid) return;
  grid.innerHTML = '';
  PROJECTS.forEach((project) => {
    const card = document.createElement('div');
    card.className = 'gui-project-card';
    card.innerHTML = `
      <div class="project-header">
        <h3>${project.title}</h3>
        <span class="project-badge">${project.badge}</span>
      </div>
      <p>${project.summary}</p>
      <div class="project-tech">${project.tech.map((t) => `<span class="tech-tag">${t}</span>`).join('')}</div>
      <ul class="project-bullets">${project.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>
    `;
    const link = document.createElement('button');
    link.className = 'project-link';
    link.textContent = 'View Details →';
    link.onclick = () => {
      executeQuickCommand(`cat ~/projects/${slugify(project.title)}.md`);
      setMode('terminal');
    };
    card.appendChild(link);
    grid.appendChild(card);
  });
}

function renderGuiSkills() {
  const grid = document.querySelector('#gui-skills .gui-grid');
  if (!grid) return;
  grid.innerHTML = '';
  SKILL_GROUPS.forEach((group) => {
    const card = document.createElement('div');
    card.className = 'gui-card';
    card.innerHTML = `<h3>${group.title}</h3><p>${group.items.join(' | ')}</p>`;
    grid.appendChild(card);
  });
}

function renderGuiExperience() {
  const timeline = document.querySelector('#gui-experience .gui-timeline');
  if (!timeline) return;
  timeline.innerHTML = '';
  EXPERIENCES.forEach((exp) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="timeline-date">${exp.dates}</div>
      <div class="timeline-content">
        <h3>${exp.title}</h3>
        <h4>${exp.company} • ${exp.location}</h4>
        <div class="timeline-achievements">${exp.bullets.map((b) => `<span>${b}</span>`).join('')}</div>
        <div class="timeline-tech">${(exp.tech || []).map((t) => `<span class="tech-badge">${t}</span>`).join('')}</div>
      </div>
    `;
    timeline.appendChild(item);
  });
}

// Utility
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Hack game
class HackGame {
  constructor() {
    this.container = document.getElementById('hackingContainer');
    this.output = document.getElementById('hackingOutput');
    this.input = document.getElementById('hackingInput');
    this.exitButton = document.querySelector('.hacking-exit-btn');
    this.closeButton = document.querySelector('.hacking-close-btn');
    this.typingIndicator = document.getElementById('hackTypingIndicator');
    this.level = 1;
    this.active = false;
    this.isTyping = false;
    this.levels = {
      1: {
        title: 'LEVEL 1: THE WARM-UP',
        question: 'What year did Jeremy Lin create "Linsanity" in the NBA?',
        answer: '2012',
        hint: 'It happened in February between 2010 and 2015.'
      },
      2: {
        title: 'LEVEL 2: SIMPLE MATH',
        question: 'What is 21 + 21?',
        answer: '42',
        hint: 'The answer to life, the universe, and everything.'
      },
      3: {
        title: 'LEVEL 3: TECH TRIVIA',
        question: 'Complete this: HTML, CSS, and _____?',
        answer: 'javascript',
        hint: 'The language that makes the web come alive.'
      },
      4: {
        title: 'LEVEL 4: PATTERN RECOGNITION',
        question: 'What comes next: 2, 4, 6, 8, ___?',
        answer: '10',
        hint: 'Count by twos.'
      },
      5: {
        title: 'FINAL LEVEL: THE PASSWORD',
        question: 'Type the magic word: "please"',
        answer: 'please',
        hint: 'Manners matter.'
      }
    };
  }

  open() {
    this.active = true;
    this.setTyping(false);
    this.level = 1;
    this.output.innerHTML = '';
    this.input.value = '';
    this.container.classList.add('active');
    this.bindEvents();
    this.focus();
    this.runIntro();
  }

  bindEvents() {
    this.input.onkeydown = (e) => {
      if (!this.active) return;
      if (e.key === 'Enter' && (!this.isTyping || ['exit', 'quit'].includes(this.input.value.trim().split(' ')[0]))) {
        const command = this.input.value.trim();
        if (command) {
          this.addLine(`hacker@breach:~$ ${command}`, 'hack-command');
          this.process(command);
          this.input.value = '';
        }
      } else if (e.key === 'Escape') {
        this.exit();
      }
    };

    this.container.onclick = (e) => {
      if (!e.target.closest('.hacking-exit-btn') && !e.target.closest('.hacking-close-btn')) {
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
      { text: '=== WELCOME TO HACK MODE ===', className: 'hack-section' },
      { text: '', className: '' },
      { text: 'Initializing security challenge...', className: 'hack-info' },
      { text: 'Loading hacking modules...', className: 'hack-warning' },
      { text: 'System ready.', className: 'hack-success' },
      { text: '', className: '' },
      { text: 'Commands:', className: 'hack-warning' },
      { text: '  answer <your_answer> - Submit your answer', className: 'hack-info' },
      { text: '  hint - Get a hint for the current level', className: 'hack-info' },
      { text: '  skip - Skip to next level', className: 'hack-info' },
      { text: '  exit - Leave hack mode', className: 'hack-info' },
      { text: '', className: '' }
    ];
    await this.typeLines(intro);
    this.startLevel(1);
    this.focus();
  }

  async typeLines(lines, speed = 20) {
    this.setTyping(true);
    for (const line of lines) {
      await this.typeLine(line.text, line.className, speed);
      await this.wait(120);
    }
    this.setTyping(false);
  }

  typeLine(text, className = '', speed = 20) {
    return new Promise((resolve) => {
      const node = document.createElement('div');
      node.className = `hack-line ${className}`;
      this.output.appendChild(node);
      if (!text) {
        this.scroll();
        return resolve();
      }
      let i = 0;
      const step = () => {
        if (i < text.length) {
          node.textContent = text.slice(0, i + 1);
          i += 1;
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
    if (this.typingIndicator) {
      this.typingIndicator.style.opacity = active ? '1' : '0';
    }
  }

  startLevel(level) {
    const data = this.levels[level];
    if (!data) return this.victory();
    this.level = level;
    this.typeLines([
      { text: '', className: '' },
      { text: '─'.repeat(50), className: 'hack-section' },
      { text: data.title, className: 'hack-section' },
      { text: '─'.repeat(50), className: 'hack-section' },
      { text: data.question, className: 'hack-warning' },
      { text: 'Type "answer <your_answer>" to submit', className: 'hack-info' }
    ]);
  }

  process(raw) {
    const [cmd, ...rest] = raw.split(' ');
    const arg = rest.join(' ').trim();
    if (cmd === 'exit' || cmd === 'quit') return this.exit();

    if (cmd === 'hint') {
      const level = this.levels[this.level];
      if (level) this.typeLine('HINT: ' + level.hint, 'hack-warning');
    } else if (cmd === 'skip') {
      this.typeLines([{ text: 'Skipping level...', className: 'hack-info' }]).then(() => this.startLevel(this.level + 1));
    } else if (cmd === 'answer') {
      if (!arg) return this.typeLine('Usage: answer <your_answer>', 'hack-error');
      const level = this.levels[this.level];
      if (arg.toLowerCase() === level.answer.toLowerCase()) {
        this.typeLines([
          { text: '[SUCCESS] Correct answer!', className: 'hack-success' },
          { text: 'Advancing...', className: 'hack-info' }
        ]).then(() => this.startLevel(this.level + 1));
      } else {
        this.typeLines([
          { text: '[FAILED] Wrong answer. Try again!', className: 'hack-error' },
          { text: 'Type "hint" if you are stuck.', className: 'hack-warning' }
        ]);
      }
    } else {
      this.typeLine('Unknown command. Try: answer, hint, skip, exit', 'hack-error');
    }
  }

  async victory() {
    await this.typeLines([
      { text: '🎉 CONGRATULATIONS! YOU COMPLETED ALL LEVELS! 🎉', className: 'hack-success' },
      { text: 'Secret message: Keep learning, keep growing!', className: 'hack-warning' },
      { text: 'Closing in 3 seconds...', className: 'hack-info' }
    ]);
    setTimeout(() => this.exit(), 3000);
  }

  exit() {
    this.active = false;
    this.setTyping(false);
    this.container.classList.remove('active');
    this.output.innerHTML = '';
    this.input.value = '';
    if (terminalSystem) {
      terminalSystem.addOutput('Exited hack mode.', 'info');
      terminalSystem.scrollToBottom();
      terminalSystem.focusInput();
    }
  }

  scroll() {
    this.output.scrollTop = this.output.scrollHeight;
  }
}

// Terminal
class TerminalPortfolio {
  constructor() {
    this.output = document.getElementById('terminalOutput');
    this.input = document.getElementById('terminalInput');
    this.prompt = document.getElementById('prompt');
    this.cursor = document.getElementById('cursor');
    this.body = document.querySelector('.terminal-body');
    this.username = 'visitor';
    this.currentPath = '~';
    this.commandHistory = [];
    this.historyIndex = -1;
    this.matrixMode = false;
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
      const content = [`# ${project.title}`, '', `Focus: ${project.badge}`, '', 'Tech:', project.tech.map((t) => `- ${t}`).join('\n'), '', 'Highlights:', project.bullets.map((b) => `- ${b}`).join('\n')].join('\n');
      projectFiles[filename] = { type: 'file', content };
    });
    const projectIndex = ['PROJECTS:', ...PROJECTS.map((p) => `- ${p.title} — ${p.summary} (Tech: ${p.tech.join(', ')})`)].join('\n');
    projectFiles['README.md'] = {
      type: 'file',
      content: projectIndex
    };

    const skillsContent = SKILL_GROUPS.map((group) => `${group.title}:\n- ${group.items.join(' | ')}`).join('\n\n');

    const experienceContent = EXPERIENCES.map((exp) => {
      return `${exp.title} @ ${exp.company} (${exp.dates})\n${exp.location}\n- ${exp.bullets.join('\n- ')}`;
    }).join('\n\n');

    return {
      '~': {
        type: 'directory',
        contents: {
          about: {
            type: 'directory',
            contents: {
              'bio.txt': {
                type: 'file',
                content: `ERIC HURCHEY - Software Engineer & Product Manager\n==============================================\n\nI blend engineering with product thinking to ship AI-powered experiences, polished interfaces, and resilient systems. I'm a Brandeis CS student (Math minor), graduating May 2025, focused on turning ideas into usable products fast.\n\nRecent Highlights:\n- Building an AI testing platform (myGenius) that converts PDFs into adaptive practice tests with NLP/ML.\n- Shipping an LLM-driven Website Cloner that rebuilds public sites into clean components in minutes.\n- Creating a React Native food suggestion app that recognizes ingredients from photos and recommends recipes.\n\nStrengths:\n- Full-stack web & mobile (React/Next.js/React Native, Node/FastAPI)\n- Data & cloud (PostgreSQL/MySQL/MongoDB, AWS S3, Docker, CI/CD)\n- Collaboration & mentoring (TA for 100+ students; document, teach, iterate)\n\nWhat drives me: shipping useful tools, exploring generative AI, and designing delightful user experiences.`
              },
              'interests.txt': {
                type: 'file',
                content: `INTERESTS\n=========\n- Generative AI & prompt engineering\n- Full-stack web & mobile apps\n- Teaching and mentoring (100+ students taught)\n- Basketball (Knicks & Warriors)\n- Classical violin (14+ years)`
              }
            }
          },
          skills: {
            type: 'directory',
            contents: {
              'summary.txt': { type: 'file', content: skillsContent }
            }
          },
          projects: { type: 'directory', contents: projectFiles },
          experience: {
            type: 'directory',
            contents: {
              'current.txt': { type: 'file', content: experienceContent }
            }
          },
          'contact.txt': {
            type: 'file',
            content: `CONTACT\n=======\nEmail: eric.hurchey@example.com\nLinkedIn: linkedin.com/in/erichurchey\nGitHub: github.com/erichurchey`
          },
          'resume.pdf': { type: 'file', content: '[Use "download resume" to fetch the PDF]' }
        }
      }
    };
  }

  buildCommands() {
    return {
      help: () => this.showHelp(),
      '?': () => this.showHelp(),
      clear: () => this.clearTerminal(),
      ls: (args) => this.listDirectory(args),
      cd: (args) => this.changeDirectory(args),
      pwd: () => this.printWorkingDirectory(),
      cat: (args) => this.readFile(args),
      whoami: () => this.addOutput('Eric Hurchey', 'info'),
      date: () => this.addOutput(new Date().toString(), 'info'),
      echo: (args) => this.addOutput(args.join(' '), 'info'),
      download: (args) => this.downloadFile(args),
      gui: () => this.switchToGui(),
      find: (args) => this.findFiles(args),
      grep: (args) => this.grepFiles(args),
      history: () => this.showHistory(),
      exit: () => this.addOutput('Use the GUI button or close the tab to exit. 😄', 'warning'),
      hack: () => this.startHackingGame(),
      matrix: () => this.matrixEffect(),
      'red pill': () => this.redPill(),
      'blue pill': () => this.bluePill(),
      red: () => this.redPill(),
      blue: () => this.bluePill(),
      knicks: () => this.easterEggKnicks(),
      violin: () => this.easterEggViolin(),
      linsanity: () => this.easterEggLinsanity()
    };
  }

  setupEvents() {
    this.input.addEventListener('keydown', (e) => this.handleKeyPress(e));
    this.input.addEventListener('input', () => this.updateCursorPosition());
    this.input.addEventListener('click', () => this.updateCursorPosition());
    document.addEventListener('selectionchange', () => {
      if (document.activeElement === this.input) this.updateCursorPosition();
    });
    document.addEventListener('click', (e) => {
      const hackActive = document.getElementById('hackingContainer').classList.contains('active');
      if (currentMode === 'terminal' && !hackActive && !e.target.closest('.quick-commands-bar')) this.focusInput();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && quickCommandsVisible) {
        hideQuickCommands();
      }
    });
  }

  focusInput() {
    setTimeout(() => this.input.focus(), 0);
  }

  updateCursorPosition() {
    const cursorPos = this.input.selectionStart || 0;
    const textBeforeCursor = this.input.value.substring(0, cursorPos);
    const measurer = document.createElement('span');
    measurer.style.position = 'absolute';
    measurer.style.visibility = 'hidden';
    measurer.style.font = getComputedStyle(this.input).font;
    measurer.style.whiteSpace = 'pre';
    measurer.textContent = textBeforeCursor || '';
    document.body.appendChild(measurer);
    const width = measurer.getBoundingClientRect().width;
    document.body.removeChild(measurer);
    this.cursor.style.left = `${width}px`;
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.executeCommand();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      quickCommandsVisible ? hideQuickCommands() : showQuickCommands();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.navigateHistory(1);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      this.clearTerminal();
    } else if (e.key === 'Escape' && quickCommandsVisible) {
      e.preventDefault();
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
    this.addOutput(`${this.prompt.textContent} ${fullCommand}`, 'command');

    const parts = fullCommand.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const command = parts[0];
    const args = parts.slice(1).map((a) => a.replace(/^"|"$/g, ''));

    if (this.commands[command]) {
      this.commands[command](args);
    } else {
      this.addOutput(`bash: ${command}: command not found`, 'error');
    }

    this.input.value = '';
    this.updateCursorPosition();
    this.scrollToBottom();
  }

  getCurrentDirectory() {
    const parts = this.currentPath.split('/');
    let current = this.fileSystem['~'];
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] && current.contents && current.contents[parts[i]]) {
        current = current.contents[parts[i]];
      }
    }
    return current;
  }

  changeDirectory(args) {
    if (!args || args.length === 0 || args[0] === '~') {
      this.currentPath = '~';
    } else if (args[0] === '..') {
      const parts = this.currentPath.split('/');
      if (parts.length > 1) parts.pop();
      this.currentPath = parts.join('/') || '~';
    } else {
      const target = this.currentPath === '~' ? `~/${args[0]}` : `${this.currentPath}/${args[0]}`;
      const parts = target.split('/');
      let current = this.fileSystem['~'];
      let valid = true;
      for (let i = 1; i < parts.length; i++) {
        if (parts[i] && current.contents && current.contents[parts[i]] && current.contents[parts[i]].type === 'directory') {
          current = current.contents[parts[i]];
        } else {
          valid = false;
          break;
        }
      }
      if (valid) this.currentPath = target;
      else return this.addOutput(`bash: cd: ${args[0]}: No such file or directory`, 'error');
    }
    this.updatePrompt();
  }

  listDirectory(args) {
    const showHidden = args && args.includes('-a');
    const dir = this.getCurrentDirectory();
    if (!dir || dir.type !== 'directory') return this.addOutput('Not a directory', 'error');
    const items = [];
    for (const [name, item] of Object.entries(dir.contents || {})) {
      if (!showHidden && name.startsWith('.')) continue;
      const display = item.type === 'directory' ? `${name}/` : name;
      items.push(`<span class="${item.type === 'directory' ? 'clickable-item directory' : 'clickable-item'}" onclick="terminalSystem.handleItemClick('${name}')">${display}</span>`);
    }
    const line = document.createElement('div');
    line.className = 'output-line output-info';
    line.innerHTML = items.join('  ');
    this.output.appendChild(line);
    this.addOutput('', '');
  }

  handleItemClick(name) {
    const dir = this.getCurrentDirectory();
    if (!dir.contents || !dir.contents[name]) return;
    if (dir.contents[name].type === 'directory') this.runCommand(`cd ${name}`);
    else this.runCommand(`cat ${name}`);
  }

  readFile(args) {
    if (!args || args.length === 0) return this.addOutput('Usage: cat <filename>', 'error');
    const filePath = args[0];
    let target = null;

    const resolve = (path) => {
      let current = this.fileSystem['~'];
      const parts = path.split('/');
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!part) continue;
        if (current.contents && current.contents[part] && current.contents[part].type === 'directory') {
          current = current.contents[part];
        } else {
          return null;
        }
      }
      return current.contents ? current.contents[parts[parts.length - 1]] : null;
    };

    if (filePath.includes('/')) {
      let normalized = filePath.startsWith('~/') ? filePath.slice(2) : filePath;
      target = resolve(normalized);
    } else {
      const dir = this.getCurrentDirectory();
      target = dir.contents ? dir.contents[filePath] : null;
    }

    if (!target) return this.addOutput(`cat: ${filePath}: No such file or directory`, 'error');
    if (target.type === 'directory') return this.addOutput(`cat: ${filePath}: Is a directory`, 'error');
    this.addOutput(target.content, 'info');
    this.scrollToBottom();
  }

  addOutput(text, className = '') {
    const line = document.createElement('div');
    line.className = `output-line ${className ? 'output-' + className : ''}`;
    line.textContent = text;
    this.output.appendChild(line);
  }

  addHTML(html, className = '') {
    const line = document.createElement('div');
    line.className = `output-line ${className ? 'output-' + className : ''}`;
    line.innerHTML = html;
    this.output.appendChild(line);
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.body.scrollTop = this.body.scrollHeight;
    });
  }

  showWelcomeMessage() {
    const ascii = `
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║   ███████╗██████╗ ██╗ ██████╗                                        ║
║   ██╔════╝██╔══██╗██║██╔════╝                                        ║
║   █████╗  ██████╔╝██║██║                                             ║
║   ██╔══╝  ██╔══██╗██║██║                                             ║
║   ███████╗██║  ██║██║╚██████╗                                        ║
║   ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝                                        ║
║                                                                    ║
║  ██╗  ██╗██╗   ██╗██████╗  ██████╗██╗  ██╗███████╗██╗   ██╗        ║
║  ██║  ██║██║   ██║██╔══██╗██╔════╝██║  ██║██╔════╝╚██╗ ██╔╝        ║
║  ███████║██║   ██║██████╔╝██║     ███████║█████╗   ╚████╔╝         ║
║  ██╔══██║╚██╗ ██╔╝██╔══██╗██║     ██╔══██║██╔══╝    ╚██╔╝          ║
║  ██║  ██║ ╚████╔╝ ██║  ██║╚██████╗██║  ██║███████╗   ██║           ║
║  ╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝           ║
║                                                                    ║
║        Aspiring Software Engineer & Product Manager                ║
║                     Welcome To My Portfolio!                       ║
╚════════════════════════════════════════════════════════════════════╝`;
    const container = document.createElement('div');
    container.className = 'ascii-art-container';
    const pre = document.createElement('pre');
    pre.className = 'ascii-art';
    pre.textContent = ascii;
    container.appendChild(pre);
    this.output.appendChild(container);
    this.addOutput('', '');
    this.addOutput('Welcome! Type "help" or press Tab for quick commands.', 'success');
    this.addOutput('Try "ls" to browse, "hack" to play the hacking game, or "gui" for the visual site.', 'info');
    this.addOutput('', '');
    this.scrollToBottom();
  }

  showHelp() {
    this.addOutput('', '');
    this.addOutput('AVAILABLE COMMANDS:', 'section');
    this.addOutput('  ls [-a]            List directory contents', 'info');
    this.addOutput('  cd <dir>           Change directory', 'info');
    this.addOutput('  cat <file>         Show file contents', 'info');
    this.addOutput('  echo <text>        Print text', 'info');
    this.addOutput('  find <pattern>     Find files by name', 'info');
    this.addOutput('  grep <pattern>     Search inside files (current dir)', 'info');
    this.addOutput('  clear              Clear terminal', 'info');
    this.addOutput('  download resume    Grab my resume PDF', 'info');
    this.addOutput('  gui                Switch to visual mode', 'info');
    this.addOutput('  hack               Launch hacking mini-game', 'success');
    this.addOutput('  matrix             Matrix rain effect', 'success');
    this.addOutput('  red pill | blue pill (after matrix)', 'warning');
    this.addOutput('  knicks | violin | linsanity', 'warning');
    this.addOutput('', '');
    this.scrollToBottom();
  }

  clearTerminal() {
    this.output.innerHTML = '';
    this.currentPath = '~';
    this.matrixUnlocked = false;
    this.updatePrompt();
    this.showWelcomeMessage();
  }

  printWorkingDirectory() {
    this.addOutput(this.currentPath === '~' ? '/home/eric' : this.currentPath.replace('~', '/home/eric'), 'info');
  }

  downloadFile(args) {
    if (args && args[0] === 'resume') {
      this.addOutput('Initializing download manager...', 'warning');
      this.scrollToBottom();

      setTimeout(() => {
        this.addOutput('Connecting to server...', 'info');
        this.scrollToBottom();
      }, 600);

      setTimeout(() => {
        this.addOutput('Fetching eric_hurchey_resume.pdf...', 'info');
        this.scrollToBottom();
      }, 1200);

      setTimeout(() => {
        this.addOutput('Verifying file integrity...', 'info');
        this.scrollToBottom();
      }, 1800);

      setTimeout(() => {
        this.addOutput('Resume downloaded successfully!', 'success');
        const line = document.createElement('div');
        line.className = 'output-line';
        line.innerHTML = `
          <span class="output-info">File ready: eric_hurchey_resume.pdf</span>
          <button class="inline-btn" style="margin-left: 12px;" onclick="window.open('https://example.com/eric_hurchey_resume.pdf', '_blank')">
            📥 Download PDF
          </button>
        `;
        this.output.appendChild(line);
        this.scrollToBottom();
      }, 2400);
    } else {
      this.addOutput('Usage: download resume', 'error');
    }
  }

  switchToGui() {
    this.addOutput('Switching to visual mode...', 'info');
    setTimeout(() => setMode('gui'), 300);
  }

  findFiles(args) {
    if (!args || !args.length) return this.addOutput('Usage: find <pattern>', 'error');
    const pattern = args[0].toLowerCase();
    const results = [];
    const search = (dir, path) => {
      for (const [name, item] of Object.entries(dir.contents || {})) {
        const fullPath = path ? `${path}/${name}` : name;
        if (name.toLowerCase().includes(pattern)) results.push(fullPath);
        if (item.type === 'directory') search(item, fullPath);
      }
    };
    search(this.fileSystem['~'], '.');
    if (results.length === 0) this.addOutput(`find: no files matching '${pattern}'`, 'warning');
    else results.forEach((r) => this.addOutput(`./${r}`, 'info'));
  }

  grepFiles(args) {
    if (!args || args.length === 0) return this.addOutput('Usage: grep <pattern> [file]', 'error');
    const pattern = args[0].toLowerCase();
    const targetFile = args[1];
    const dir = this.getCurrentDirectory();

    const searchFile = (name, file) => {
      if (file.type !== 'file') return;
      const lines = file.content.split('\n');
      lines.forEach((line, i) => {
        if (line.toLowerCase().includes(pattern)) this.addOutput(`${name}:${i + 1}: ${line}`, 'info');
      });
    };

    if (targetFile) {
      const file = dir.contents ? dir.contents[targetFile] : null;
      if (!file) return this.addOutput(`grep: ${targetFile}: No such file`, 'error');
      searchFile(targetFile, file);
    } else {
      Object.entries(dir.contents || {}).forEach(([name, item]) => searchFile(name, item));
    }
  }

  showHistory() {
    this.commandHistory.forEach((cmd, i) => this.addOutput(`${i + 1}  ${cmd}`, 'info'));
  }

  startHackingGame() {
    this.addOutput('', '');
    this.addOutput('Opening hack terminal...', 'success');
    this.hackGame.open();
  }

  matrixEffect() {
    this.addOutput('', '');
    this.addOutput('ENTERING THE MATRIX...', 'success');
    this.matrixUnlocked = true;
    const matrixChars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789';
    for (let i = 0; i < 2; i++) {
      let rain = '';
      for (let j = 0; j < 8; j++) {
        let line = '';
        for (let k = 0; k < 50; k++) line += Math.random() > 0.3 ? matrixChars[Math.floor(Math.random() * matrixChars.length)] : ' ';
        rain += line + '\n';
      }
      this.addHTML(`<pre style="color: var(--terminal-green); font-family: monospace; line-height: 1; opacity: ${1 - i * 0.3};">${rain}</pre>`);
    }
    this.addOutput('Type "red pill" or "blue pill" to choose your path.', 'warning');
    this.scrollToBottom();
  }

  redPill() {
    if (!this.matrixUnlocked) {
      this.addOutput('Take the matrix command first to unlock this choice.', 'warning');
      this.scrollToBottom();
      return;
    }
    this.addOutput('', '');
    this.addOutput('You take the red pill...', 'error');
    this.scrollToBottom();
    setTimeout(() => {
      this.addOutput('You stay in Wonderland...', 'warning');
      this.addOutput('Welcome to the real world, Neo.', 'success');
      this.scrollToBottom();
    }, 400);
  }

  bluePill() {
    if (!this.matrixUnlocked) {
      this.addOutput('Take the matrix command first to unlock this choice.', 'warning');
      this.scrollToBottom();
      return;
    }
    this.addOutput('', '');
    this.addOutput('You take the blue pill...', 'info');
    this.scrollToBottom();
    setTimeout(() => {
      this.addOutput('The story ends. You wake in your bed and believe what you want.', 'info');
      this.scrollToBottom();
    }, 400);
  }

  easterEggKnicks() {
    this.addOutput('', '');
    this.addOutput('🏀 NEW YORK KNICKS & GOLDEN STATE WARRIORS FAN! 🏀', 'success');
    this.addOutput('', '');
    this.addOutput('Favorite teams: Knicks & Warriors', 'info');
    this.addOutput('Favorite players: Jeremy Lin & Stephen Curry', 'info');
    this.addOutput('', '');
    this.addOutput('Fun fact: Linsanity was one of the most exciting moments in basketball!', 'warning');
    this.addOutput("Jeremy Lin's story of perseverance really inspires me.", 'warning');
    this.addOutput('', '');
  }

  easterEggViolin() {
    this.addOutput('', '');
    this.addOutput('🎻 CLASSICAL MUSICIAN 🎻', 'success');
    this.addOutput('', '');
    this.addOutput('14+ years of violin experience!', 'info');
    this.addOutput('Concert Master in High School & Middle School', 'info');
    this.addOutput('Performed multiple solo parts during concerts', 'info');
    this.addOutput('', '');
    this.addOutput('Music taught me discipline, teamwork, and attention to detail.', 'warning');
    this.addOutput('These skills translate perfectly to software engineering!', 'warning');
    this.addOutput('', '');
  }

  easterEggLinsanity() {
    this.addOutput('', '');
    this.addOutput('🔥 LINSANITY FOREVER! 🔥', 'success');
    this.addOutput('', '');
    const linsanity = `
╔═══════════════════════════════╗
║  February 2012 - Never Forget ║
║  7 games, 7 wins              ║
║  An underdog story that       ║
║  inspired millions!           ║
╚═══════════════════════════════╝`;
    this.addHTML(`<pre style="color: var(--terminal-yellow)">${linsanity}</pre>`);
    this.addOutput('', '');
    this.addOutput('Jeremy Lin showed that with hard work and opportunity,', 'info');
    this.addOutput('anything is possible. This mindset drives my approach', 'info');
    this.addOutput('to software engineering and product management!', 'info');
    this.addOutput('', '');
  }

  navigateHistory(direction) {
    if (!this.commandHistory.length) return;
    if (direction === -1 && this.historyIndex > 0) this.historyIndex--;
    else if (direction === 1 && this.historyIndex < this.commandHistory.length - 1) this.historyIndex++;
    else if (direction === 1 && this.historyIndex === this.commandHistory.length - 1) {
      this.historyIndex = this.commandHistory.length;
      this.input.value = '';
      this.updateCursorPosition();
      return;
    }
    if (this.historyIndex >= 0 && this.historyIndex < this.commandHistory.length) {
      this.input.value = this.commandHistory[this.historyIndex];
      this.updateCursorPosition();
    }
  }

  updatePrompt() {
    const pathLabel = this.currentPath === '~' ? 'home' : this.currentPath.split('/').pop() || 'home';
    this.prompt.textContent = `${this.username}@${pathLabel}:~$`;
  }

  startClock() {
    const update = () => {
      document.getElementById('time').textContent = new Date().toTimeString().split(' ')[0];
    };
    update();
    setInterval(update, 1000);
  }
}

// Init once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  renderGuiProjects();
  renderGuiSkills();
  renderGuiExperience();
  terminalSystem = new TerminalPortfolio();
  window.terminalSystem = terminalSystem;
});

// Expose hack exit for button
function exitHackMode() {
  if (terminalSystem) terminalSystem.hackGame.exit();
}
window.exitHackMode = exitHackMode;
